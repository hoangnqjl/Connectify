import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { IoSearchOutline, IoMenu } from "react-icons/io5";
import { RiShoppingCart2Line, RiUserReceivedLine } from "react-icons/ri";
import { useEffect, useRef, useState } from 'react';

import electronicService from '@/services/electronicService';
import { formatAvatarUrl } from '@/utils/formatPrice';
import { useUser } from '@/contexts/UserContext';
import authService from '@/services/authService';
import Menu from '../Menu';

const cx = classNames.bind(styles);

function Header() {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef();
  const navigate = useNavigate();

  const { user, setUser } = useUser();
  const isLogin = !!user;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchResults = async () => {
        if (keyword.trim() === '') {
          setSearchResults([]);
          return;
        }
        const { success, data } = await electronicService.searchElectronics(keyword);
        if (success) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      };
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className={cx("wrapper", 'w-full')}>
      <div className={cx('content', 'flex', 'justify-between', 'items-center')}>
        <div className={cx('flex', 'justify-center', 'items-center')}>
          <Link to='/'><h1 className={cx('text-[30px]', 'font-bold', 'mr-20px', 'logo')}>Connectify</h1></Link>
          <ul className={cx('nav', 'hidden', 'lg:flex', 'items-center', 'justify-center')}>
            <li className={cx('nav-item')}>
              <NavLink to="/" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                Trang Chủ
              </NavLink>
            </li>
            <li className={cx('nav-item')}>
              <NavLink to="/mobile" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                Điện thoại
              </NavLink>
            </li>
            <li className={cx('nav-item')}>
              <NavLink to="/laptop" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                Laptop
              </NavLink>
            </li>
          </ul>
        </div>

        <div className={cx('flex', 'justify-center', 'items-center')}>
          <div className={cx('search', 'flex', 'items-center', 'relative')}>
            <IoSearchOutline className={cx('search-icon')} />
            <input
              className={cx('search-input')}
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className={cx('search-results', 'absolute', 'top-full', 'left-0', 'bg-white', 'shadow-md', 'z-10', 'w-full', 'max-h-[300px]', 'overflow-y-auto')}>
                {searchResults.map((item) => (
                  <li key={item.id} className={cx('search-result-item', 'p-2', 'cursor-pointer', 'hover:bg-gray-100')}>
                    <Link to={`/product/${item.id}`} onClick={() => setKeyword('')}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {user?.type !== 'admin' && (
            <Link to='/cart' className={cx('cart')}>
              <RiShoppingCart2Line className={cx('text-[20px]')} />
            </Link>
          )}

          <div className={cx('auth', 'flex', 'items-center')}>
            {!isLogin ? (
              <NavLink to="/login" className={cx('btn-login')}>
                <RiUserReceivedLine className={cx('text-[20px]', 'btn-login-icon')} />
                <span className={cx('text-[14px]', 'btn-login-title', 'ml-[6px]', 'lg:block', 'hidden')}>
                  login now!
                </span>
              </NavLink>
            ) : (
              <div className={cx('relative', 'flex','items-center')}>
                <Link to='/profile'>
                  <img
                    src={formatAvatarUrl(user?.avatar)}
                    alt="avatar"
                    className={cx("w-[40px]"," h-[40px]"," rounded-full ","cursor-pointer"," ml-[10px] ",'avt-header')}
                    onError={(e) => { e.target.src = "/images/testavt.png"; }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setShowUserMenu(true);
                    }}
                  />
                </Link>

                {showUserMenu && (
                  <ul
                    ref={userMenuRef}
                    className="absolute z-50 bg-white shadow-md rounded-md py-2 w-[120px] text-sm right-0 translate-y-full border-[1px]"
                  >
                    {user?.type === 'admin' && localStorage.getItem('token') && (
                      <li className="px-4 py-4 hover:bg-gray-100 cursor-pointer text-[14px]">
                        <Link to='/admin/dashboard'>Admin Page</Link>
                      </li>
                    )}
                    <li
                      className="px-4 py-4 hover:bg-gray-100 cursor-pointer text-[14px]"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                )}
              </div>
            )}

            <div className={cx('btn-menu', 'lg:hidden')} onClick={() => setIsShowMenu(prev => !prev)}>
              <IoMenu className={cx('lg:hidden')} />
            </div>
          </div>
        </div>
      </div>

      {isShowMenu && <Menu onClose={() => setIsShowMenu(false)} />}
    </div>
  );
}

export default Header;