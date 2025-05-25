import classNames from 'classnames/bind';
import styles from './Menu.module.scss';
import { IoClose } from "react-icons/io5";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import authService from '@/services/authService';
import { formatAvatarUrl } from '@/utils/formatPrice';

const cx = classNames.bind(styles);
function Menu({ onClose }) {
    return (
        <div className={cx('wrapper')}>
                <div className={cx('content')}>
                   <div className={cx('w-full','flex','justify-between','items-center','header')}>
                        <div onClick={onClose} className={cx('close-icon')}>
                            <IoClose />
                         </div>
                        <Link to='/profile'> <img src="/images/testavt.png" alt="avatar"  className={cx('w-[40px]','h-[40px]','rounded-[50%]','cursor-pointer','avt-auth')}/></Link>
                   </div>
                   <div className={cx('items')}>
                        <ul className={cx('nav', 'items-center', 'justify-center','flex','flex-col')}>
                        <li className={cx('nav-item')}>
                            <NavLink
                            to="/"
                            className={({ isActive }) =>
                                cx('nav-link', { active: isActive })
                            }
                            >
                            Trang Chủ
                            </NavLink>
                        </li>
                        <li className={cx('nav-item')}>
                            <NavLink
                            to="/mobile"
                            className={({ isActive }) =>
                                cx('nav-link', { active: isActive })
                            }
                            >
                            Điện thoại
                            </NavLink>
                        </li>
                        <li className={cx('nav-item')}>
                            <NavLink
                            to="/laptop"
                            className={({ isActive }) =>
                                cx('nav-link', { active: isActive })
                            }
                            >
                            Laptop
                            </NavLink>
                        </li>
                        </ul>
                   </div>

                </div>
        </div>
    );
}

export default Menu;