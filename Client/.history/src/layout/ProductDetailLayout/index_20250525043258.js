import classNames from 'classnames/bind';
import styles from './ProductDetailLayout.module.scss';
import Header from '@/components/Header';
import Slider from '@/components/Slider';
import Footer from '@/components/Footer';

const cx = classNames.bind(styles);

function ProducDetailLayout({children}) {
    return (
        <div className={cx('container',"wrapper","flex","w-screen","h-screen",'flex-col')}>
            <Header/>
           <div className={cx('body')}>
                <div className={cx("content","flex-grow")}>
                    {children}
                </div>
                 <Footer/>
           </div>
        </div>
    );
}

export default ProducDetailLayout;