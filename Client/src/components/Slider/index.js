import classNames from 'classnames/bind';
import styles from './Slider.module.scss';



const cx = classNames.bind(styles);
function Slider({isLaptop}) {
    return ( 
        <div className={cx('wrapper','w-full')}>
          {
            !isLaptop ?
            <img alt='slider' src="http://localhost:1512/images/slider.png" className={cx('slider')}/>
            : 
              <img alt='slider' src="http://localhost:1512/images/sliderlaptop.png" className={cx('slider')}/>
          } 
        </div>
     );
}

export default Slider;