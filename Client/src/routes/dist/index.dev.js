"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.privateRoutes = exports.publicRoutes = void 0;

var _Login = _interopRequireDefault(require("@/pages/Auth/Login"));

var _HomePage = _interopRequireDefault(require("@/pages/HomePage"));

var _LaptopPage = _interopRequireDefault(require("@/pages/LaptopPage"));

var _MobilePage = _interopRequireDefault(require("@/pages/MobilePage"));

var _BuyPage = _interopRequireDefault(require("@/pages/BuyPage"));

var _Signup = _interopRequireDefault(require("@/pages/Auth/Signup"));

var _ProductDetail = _interopRequireDefault(require("@/pages/ProductDetail"));

var _ProductDetailLayout = _interopRequireDefault(require("@/layout/ProductDetailLayout"));

var _OnlyHeaderLayout = _interopRequireDefault(require("@/layout/OnlyHeaderLayout"));

var _Profile = _interopRequireDefault(require("@/pages/Profile"));

var _LaptopLayout = _interopRequireDefault(require("@/layout/LaptopLayout"));

var _Cart = _interopRequireDefault(require("@/pages/Cart"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var publicRoutes = [{
  path: '/login',
  component: _Login.default,
  layout: null
}, {
  path: '/signup',
  component: _Signup.default,
  layout: null
}, {
  path: '/',
  component: _HomePage.default
}, {
  path: '/laptop',
  component: _LaptopPage.default,
  layout: _LaptopLayout.default
}, {
  path: '/mobile',
  component: _MobilePage.default
}, {
  path: '/product/:id',
  component: _ProductDetail.default,
  layout: _ProductDetailLayout.default
}, {
  path: '/profile',
  component: _Profile.default,
  layout: _OnlyHeaderLayout.default
}];
exports.publicRoutes = publicRoutes;
var privateRoutes = [{
  path: '/buy/:id',
  component: _BuyPage.default,
  layout: _OnlyHeaderLayout.default
}, {
  path: '/cart',
  component: _Cart.default,
  layout: _OnlyHeaderLayout.default
}];
exports.privateRoutes = privateRoutes;
//# sourceMappingURL=index.dev.js.map
