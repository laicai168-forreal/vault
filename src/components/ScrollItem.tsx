import React from "react";
import './ScrollItem.scss';
import defaultAvatar from '../assets/images/default-avatar.jpg'

type ScrollItemProps = {
    width?: number;
    height?: number;
    translateX?: number;
    translateY?: number;
    image?: string;
    id?: string;
    shortDescription?: string;
    showFooter?: boolean;
    optimizeByVisibility?: boolean;
    visible?: boolean;
    price?: number;
    location?: string;
}

const ScrollItem = (
    {
        width,
        height,
        translateX = 0,
        translateY = 0,
        image,
        id: id,
        shortDescription,
        showFooter,
        optimizeByVisibility = false,
        visible = true,
        price,
        location,
    }: ScrollItemProps
) => {
    return (
        <div
            className="scroll-item-container"
            style={
                {
                    width: width,
                    height: height,
                    transform: `translateX(${translateX}px) translateY(${translateY}px)`,
                    visibility: optimizeByVisibility && visible ? 'visible' : 'hidden',
                }
            }
        >
            <div className="scroll-item-image-container animated-gradient">
                {
                    image && <img
                        key={`img-${id}`}
                        className="scroll-item-image"
                        src={image}
                    />
                }
            </div>
            {
                showFooter &&
                <div className="scroll-item-description-container">
                    <div>
                        {shortDescription}
                    </div>
                    {
                        price !== undefined &&
                        <div className="item-price">
                            {/* TODO: currency not customized */}
                            {new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
                                price,
                            )}
                        </div>
                    }
                    {
                        location &&
                        <div className="item-info-row">
                            <div 
                                className="item-info-avatar-container"
                                style={{
                                height: 24,
                                width: 24,
                                borderRadius: 12,
                                overflow: "hidden"
                            }}>
                                <img 
                                    className="item-info-avatar"
                                    src={defaultAvatar} />
                            </div>
                            <div className="item-info-location">
                                {location}
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
};

export default ScrollItem;