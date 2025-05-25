import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { FaFacebook } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";

const cx = classNames.bind(styles);
function Footer() {
    return ( 
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <ul className={cx('list')}>
                    <li className={cx('title')}>Connectify</li>
                    <li className={cx('item')}>Copyright 2025 - Connectify store</li>
                    <li className={cx('item')}>Hotline: 1900 1511</li>
                    <li className={cx('item')}>Customer service</li>
                </ul>
                  <ul className={cx('list')}>
                    <li className={cx('title-small')}>Sản phẩm</li>
                    <li className={cx('item')}>Samsung</li>
                    <li className={cx('item')}>Apple</li>
                    <li className={cx('item')}>Asus</li>
                    <li className={cx('item')}>Realme</li>
                    <li className={cx('item')}>Xiaomi</li>
                </ul>
                  <ul className={cx('list')}> 
                    <li className={cx('title-small')}>Chính sách</li>
                    <li className={cx('item')}>Bảo mật</li>
                    <li className={cx('item')}>Bảo hành</li>
                    <li className={cx('item')}>Mua hàng</li>
                </ul>
                  <ul className={cx('list')}>
                    <li className={cx('title-small')}>Đang bán</li>
                    <li className={cx('item')}>Điện thoại</li>
                    <li className={cx('item')}>Laptop</li>
                </ul>
                  <ul className={cx('list')}>
                    <li className={cx('title-small')}>Nhận thêm thông tin mới về store</li>
                    <li className={cx()}>
                        <div className={cx('input')}>
                            <input placeholder="Write your email..."/>
                            <span>Send</span>
                        </div>
                    </li>
                    <li className={cx('')}>
                        <div className={cx('flex')}>
                            <div className={cx('social')}>
                                <FaFacebook className={cx('icon-fb')}/>
                            </div>
                            <div className={cx('social')}>
                               <AiFillTikTok className={cx('icon-tiktok')}/>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
     );
}

export default Footer;