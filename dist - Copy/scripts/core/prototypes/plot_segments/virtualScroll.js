"use strict";
/* eslint-disable max-lines-per-function */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualScrollBar = void 0;
const React = require("react");
const react_1 = require("react");
const types_1 = require("../../specification/types");
exports.VirtualScrollBar = ({ handlerBarWidth, // AxisRenderer.SCROLL_BAR_SIZE
vertical, height, initialPosition, onScroll, width, x, y, zoom, scrollBarRatio, windowSize, dataType, }) => {
    let trackSize = width;
    if (vertical) {
        trackSize = height;
    }
    let handleSize;
    if (dataType == types_1.AxisDataBindingType.Categorical) {
        handleSize = vertical ? height * scrollBarRatio : width * scrollBarRatio;
    }
    else {
        handleSize = vertical ? height / 10 : width / 10;
    }
    const mapPositionToCoordinates = React.useCallback((handlePosition) => {
        let handlePositionX = 0;
        let handlePositionY = 0;
        if (handlePosition > 100) {
            handlePosition = 100;
        }
        if (handlePosition < 0) {
            handlePosition = 0;
        }
        handlePosition =
            ((trackSize - handleSize) / 100) * (100 - handlePosition); // map % to axis position
        if (vertical) {
            handlePositionY = handlePosition;
        }
        else {
            handlePositionX = handlePosition;
        }
        return [handlePositionX, handlePositionY];
    }, [handleSize, trackSize, vertical]);
    const [position, setPosition] = React.useState(initialPosition);
    const [isActive, setActive] = React.useState(false);
    react_1.useEffect(() => {
        onScroll(position);
        // eslint-disable-next-line
    }, [windowSize]);
    const widthPerBar = !vertical ? width / windowSize : height / windowSize;
    const widthPerBarPercent = !vertical
        ? widthPerBar / width
        : widthPerBar / height;
    const [handlePositionX, handlePositionY] = React.useMemo(() => mapPositionToCoordinates(position), [position, mapPositionToCoordinates]);
    let handlerWidth = 0;
    let handlerHeight = 0;
    let buttonsWidth = 0;
    let buttonsHeight = 0;
    if (vertical) {
        handlerHeight += handleSize;
        handlerWidth = handlerBarWidth;
        buttonsHeight += handleSize / 3;
        buttonsWidth = handlerBarWidth;
    }
    else {
        handlerWidth += handleSize;
        handlerHeight = handlerBarWidth;
        buttonsHeight += handleSize / 3;
        buttonsWidth = handlerBarWidth;
    }
    const track = React.useRef(null);
    const handler = React.useRef(null);
    const onMouseMove = React.useCallback((e) => {
        if (!isActive) {
            return;
        }
        const trackElement = track.current.getBoundingClientRect();
        let deltaX = e.clientX - trackElement.left;
        let deltaY = e.clientY - trackElement.top;
        const handlerElement = handler.current.getBoundingClientRect();
        const deltaXHandler = e.clientX - handlerElement.left;
        const deltaYHandler = e.clientY - handlerElement.top;
        if (deltaXHandler > 0 && deltaXHandler < handleSize * zoom.scale) {
            deltaX = deltaX - deltaXHandler;
        }
        if (deltaYHandler > 0 && deltaYHandler < handleSize * zoom.scale) {
            deltaY = deltaY - deltaYHandler;
        }
        // debugger
        let newPosition = position;
        if (vertical) {
            const trackSize = Math.abs(trackElement.bottom - trackElement.top);
            newPosition = (deltaY / trackSize) * 100;
        }
        else {
            const trackSize = Math.abs(trackElement.right - trackElement.left);
            newPosition = 100 - (deltaX / trackSize) * 100;
        }
        if (newPosition > 100) {
            newPosition = 100;
        }
        if (newPosition - widthPerBarPercent * 100 < 0) {
            newPosition = 0;
        }
        setPosition(Math.round(newPosition));
        onScroll(Math.round(newPosition));
    }, [
        handleSize,
        isActive,
        onScroll,
        position,
        vertical,
        widthPerBarPercent,
        zoom.scale,
    ]);
    const onClick = React.useCallback((sign) => {
        let newPosition = position + sign * 5;
        if (newPosition > 100) {
            newPosition = 100;
        }
        if (newPosition < 0) {
            newPosition = 0;
        }
        setPosition(Math.round(newPosition));
        onScroll(newPosition);
    }, [onScroll, position]);
    return (React.createElement(React.Fragment, null,
        React.createElement("g", { className: "controls" },
            React.createElement("rect", { ref: track, x: Math.min(x, x + width) + (vertical ? 0 : buttonsWidth), y: -Math.max(y, y + height) + (vertical ? buttonsHeight : 0), width: Math.abs(width) - (vertical ? 0 : buttonsWidth * 2), height: Math.abs(height) - (vertical ? buttonsHeight * 2 : 0), onMouseUp: () => {
                    setActive(false);
                }, style: {
                    fill: "#e1e1e1",
                    opacity: 1,
                }, onMouseMove: onMouseMove }),
            React.createElement("rect", { ref: handler, x: Math.min(x + handlePositionX, x + handlePositionX + handlerWidth), y: -Math.max(y + handlePositionY, y + handlePositionY + handlerHeight), width: Math.abs(handlerWidth), height: Math.abs(handlerHeight), style: {
                    fill: "#b3b0ad",
                    opacity: 1,
                }, onMouseDown: () => {
                    setActive(true);
                }, onMouseUp: () => {
                    setActive(false);
                } }),
            vertical ? (React.createElement(React.Fragment, null,
                React.createElement("g", null,
                    React.createElement("rect", { ref: handler, x: Math.min(x, x + buttonsWidth), y: -Math.max(y, y + buttonsHeight), width: Math.abs(buttonsWidth), height: Math.abs(buttonsHeight), style: {
                            fill: "#b3b0ad",
                        }, onClick: () => {
                            onClick(1);
                        } }),
                    React.createElement("path", { transform: `translate(${Math.min(x, x + buttonsWidth) + buttonsWidth}, ${-Math.max(y, y + buttonsHeight) + buttonsWidth}) scale(0.005) rotate(180)`, d: "M1955 1533l-931-930-931 930-90-90L1024 421l1021 1022-90 90z" })),
                React.createElement("g", null,
                    React.createElement("rect", { ref: handler, x: Math.min(x, x + width), y: -Math.max(y, y + height), width: Math.abs(buttonsWidth), height: Math.abs(buttonsHeight), style: {
                            fill: "#b3b0ad",
                        }, onClick: () => {
                            onClick(-1);
                        } }),
                    React.createElement("path", { transform: `translate(${Math.min(x, x + width)}, ${-Math.max(y, y + height)}) scale(0.005)`, d: "M1955 1533l-931-930-931 930-90-90L1024 421l1021 1022-90 90z" })),
                React.createElement("rect", { className: "interaction-handler", x: Math.min(x, x + width) - height, y: -Math.max(y, y + height) - height, width: Math.abs(width) + width * 2, height: Math.abs(height) + width * 2, onMouseMove: onMouseMove, onMouseOut: () => {
                        setActive(false);
                    } }))) : (React.createElement(React.Fragment, null,
                React.createElement("g", null,
                    React.createElement("rect", { ref: handler, x: Math.min(x, x + width), y: -Math.max(y, y + height), width: Math.abs(buttonsWidth), height: Math.abs(height), style: {
                            fill: "#b3b0ad",
                        }, onClick: () => {
                            onClick(1);
                        } }),
                    React.createElement("path", { transform: `translate(${Math.min(x, x + width)}, ${-Math.max(y, y + height) + buttonsWidth}) scale(0.005) rotate(-90)`, d: "M1955 1533l-931-930-931 930-90-90L1024 421l1021 1022-90 90z" })),
                React.createElement("g", null,
                    React.createElement("rect", { ref: handler, x: Math.max(x, x + width) - buttonsWidth, y: -Math.max(y, y + height), width: Math.abs(buttonsWidth), height: Math.abs(height), style: {
                            fill: "#b3b0ad",
                        }, onClick: () => {
                            onClick(-1);
                        } }),
                    React.createElement("path", { transform: `translate(${Math.max(x, x + width)}, ${-Math.max(y, y + height)}) scale(0.005) rotate(90)`, d: "M1955 1533l-931-930-931 930-90-90L1024 421l1021 1022-90 90z" })),
                React.createElement("rect", { className: "interaction-handler", x: Math.min(x, x + width) - width, y: -Math.max(y, y + height) - width, width: Math.abs(width) + height * 2, height: Math.abs(height) + height * 2, onMouseMove: onMouseMove, onMouseOut: () => {
                        setActive(false);
                    } }))))));
};
//# sourceMappingURL=virtualScroll.js.map