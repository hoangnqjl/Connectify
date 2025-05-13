package com.qhoang.connectify.controller;


import com.qhoang.connectify.entities.*;
import com.qhoang.connectify.repository.*;
import com.qhoang.connectify.service.CartItemService;
import com.qhoang.connectify.service.CartService;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.UserService;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;

import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("/carts")
public class CartController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userSevice;

    @Autowired
    private ElectronicService electronicService;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartItemService cartItemService;

    private User extractUserFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUsername(token);
            return userSevice.getUserByUserId(userId);
        }
        return null;
    }

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addToCart(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("electronicId") String electronicId,
            @RequestParam("quantity") int quantity
    ) {
        User user = extractUserFromToken(authHeader);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ hoặc không tìm thấy người dùng"));
        }

        // Lấy hoặc tạo cart
        Cart cart = cartService.getCartByUser(user);
        if (cart == null) {
            cart = new Cart(user);
            cart.setCart_id(cart.generateCartId(user));
            cartService.saveCart(cart);
        }



        // Tìm sản phẩm
        Electronic electronic = electronicService.getElectronicById(electronicId);
        if (electronic == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy sản phẩm"));
        }

        // Tạo mới CartItem
        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setElectronic(electronic);
        cartItem.setQuantity(quantity);

        cartItemService.saveCartItem(cartItem);

        return ResponseEntity.ok(Collections.singletonMap("message", "Đã thêm vào giỏ hàng"));
    }


    @GetMapping("/get")
    @Transactional
    public ResponseEntity<?> getCart(
            @RequestHeader("Authorization") String authHeader
    ) {
        // Xử lý phân giải JWT để lấy thông tin người dùng
        User user = extractUserFromToken(authHeader);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ hoặc không tìm thấy người dùng"));
        }

        // Lấy giỏ hàng của người dùng
        Cart cart = cartService.getCartByUser(user);
        if (cart == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy giỏ hàng"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("cart_id", cart.getCart_id());
        response.put("user", user);
        response.put("items", cart.getItems());

        return ResponseEntity.ok(response);
    }

}
