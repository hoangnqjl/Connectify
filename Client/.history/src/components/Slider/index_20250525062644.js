import classNames from 'classnames/bind';
import styles from './Slider.module.css';

const cx = classNames.bind(styles);
function Slider({isLaptop}) {
    return (
        <div className={cx('wrapper','w-full')}>
          {
            !isLaptop ?
            <img alt='slider' src="/images/slider.png" className={cx('slider')}/>
            :
              <img alt='slider' src="/images/sliderlaptop.png" className={cx('slider')}/>
          }
        </div>
     );
}

export default Slider;