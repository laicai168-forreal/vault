import React, { ReactNode } from 'react';
import "./CPanelOverlay.scss";

type CPanelOverlayProps = {
    isOpen?: boolean;
    onClose?: () => void;
    children?: ReactNode;
}

const CPanelOverlay = ({ 
    isOpen, 
    onClose, 
    children 
}: CPanelOverlayProps) => {
    if (!isOpen) return null;

    return (
        <div className=".c-overlay-panel-backdrop" onClick={onClose}>
            <div className='c-overlay-panel' onClick={(e) => e.stopPropagation()}>
                <button className='c-overlay-panel-close-button' onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>

    );
};

export default CPanelOverlay;