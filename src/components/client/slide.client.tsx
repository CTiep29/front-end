import { Carousel } from 'antd';
import banner from '../../assets/banner.jpg';
import banner1 from '../../assets/banner1.png';
import banner2 from '../../assets/banner2.jpg';

const ImageSlider = () => {
    const images = [banner, banner1, banner2];

    return (
        <div style={{ width: '100%', overflow: 'hidden' }}>
            <Carousel autoplay dotPosition="bottom" autoplaySpeed={3000}>
                {images.map((img, index) => (
                    <div key={index}>
                        <img
                            src={img}
                            alt={`banner-${index}`}
                            style={{
                                width: '100%',
                                height: '450px',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default ImageSlider;
