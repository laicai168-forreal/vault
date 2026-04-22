import "./DetailImageViewer.scss";
import { useState } from "react";
import { ImageObj } from "../types/Images";
import { Modal } from "@mui/material";
import defaultImage from "../assets/images/default_item_image.jpg";
import { getCarCfnUrlByS3Url } from "../utils/carsUtil";
import CImage from "./common/CImage";


type DetailImageViewerProps = {
    images?: ImageObj[];
}
const DetailImageViewer = ({
    images,
}: DetailImageViewerProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleChooseImage = (index: number) => {
        setSelectedIndex(index);
    }

    return (
        <div className="detail-image-viewer-container">
            <div className="detail-image-viewer-chooser">
                {
                    images?.map((image, index) => (
                        <div
                            key={image.s3_url}
                            className={`detail-image-viewer-option ${selectedIndex === index && 'selected'}`}
                            onClick={() => handleChooseImage(index)}
                        >
                            <CImage
                                src={getCarCfnUrlByS3Url(image.s3_url, 300) || ""}
                                defaultImage={defaultImage}
                                alt={`Car thumbnail ${index + 1}`}
                                objectFit="contain"
                            />
                        </div>
                    ))
                }
            </div>
            <div className="detail-image-viewer-main">
                <div className="detail-image-viewer-main-image-container" onClick={handleOpen}>
                    <CImage
                        src={getCarCfnUrlByS3Url(images?.[selectedIndex]?.s3_url) || ""}
                        defaultImage={defaultImage}
                        alt={`Car image ${selectedIndex + 1}`}
                        objectFit="contain"
                    />
                </div>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <div className="detail-image-viewer-modal">
                    <CImage
                        src={getCarCfnUrlByS3Url(images?.[selectedIndex]?.s3_url) || ""}
                        defaultImage={defaultImage}
                        alt={`Car image ${selectedIndex + 1}`}
                        objectFit="contain"
                    />
                </div>
            </Modal>
        </div>
    )
}

export default DetailImageViewer;
