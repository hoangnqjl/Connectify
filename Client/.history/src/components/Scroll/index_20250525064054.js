import { useRef } from "react";
import classNames from "classnames/bind";
import styles from './Scroll.module.scss';
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

const cx = classNames.bind(styles);

function Scroll({ scrollRef }) {

    const scrollLeft = () => {
        scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('btn-arrow')} onClick={scrollLeft}>
                <IoMdArrowDropleft className={cx('icon-arrow')} />
            </div>
            <div className={cx('btn-arrow')} onClick={scrollRight}>
                <IoMdArrowDropright className={cx('icon-arrow')} />
            </div>
        </div>
    );
}

export default Scroll;
