"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputImageProperty = exports.ImageUploader = exports.ImageChooser = exports.InputImage = void 0;
const React = require("react");
const R = require("../../../../resources");
const globals = require("../../../../globals");
const context_component_1 = require("../../../../context_component");
const popup_controller_1 = require("../../../../controllers/popup_controller");
const utils_1 = require("../../../../utils");
const strings_1 = require("../../../../../strings");
const react_1 = require("@fluentui/react");
const fluentui_customized_components_1 = require("./fluentui_customized_components");
const styles_1 = require("./styles");
class InputImage extends context_component_1.ContextedComponent {
    constructor() {
        super(...arguments);
        this.state = { dragOver: false };
        this.startChooseImage = () => {
            globals.popupController.popupAt((context) => {
                return (React.createElement(popup_controller_1.PopupView, { context: context },
                    React.createElement(ImageChooser, { value: this.props.value, onChoose: (image) => {
                            context.close();
                            if (this.props.onChange) {
                                this.props.onChange(image);
                            }
                        } })));
            }, { anchor: this.element });
        };
        this.handleDragEnter = () => {
            this.setState({ dragOver: true });
        };
        this.handleDragLeave = () => {
            this.setState({ dragOver: false });
        };
        this.handleDragOver = (e) => {
            e.preventDefault();
        };
        this.handleDrop = (e) => {
            e.preventDefault();
            this.setState({ dragOver: false });
            if (e.dataTransfer.types.indexOf("text/uri-list") >= 0) {
                const uriList = e.dataTransfer.getData("text/uri-list");
                const uris = uriList
                    .replace(/\r/g, "")
                    .split("\n")
                    .map((x) => x.trim())
                    .filter((x) => !x.startsWith("#"));
                ImageUploader.ParseURIs(uris)
                    .then((r) => {
                    this.emitOnChange(r);
                })
                    .catch(() => { });
            }
            if (e.dataTransfer.files.length > 0) {
                ImageUploader.ParseFiles(e.dataTransfer.files).then((r) => {
                    this.emitOnChange(r);
                });
            }
        };
    }
    resolveImage(value) {
        return value;
    }
    emitOnChange(images) {
        if (images.length == 1) {
            this.props.onChange({
                src: images[0].dataURL,
                width: images[0].width,
                height: images[0].height,
            });
        }
    }
    render() {
        const isNone = this.props.value == null;
        const image = isNone ? null : this.resolveImage(this.props.value);
        let imageDisplayURL = image ? image.src : null;
        if (imageDisplayURL) {
            if (imageDisplayURL.startsWith("data:")) {
                imageDisplayURL = "(data url)";
            }
        }
        return (React.createElement("span", { className: utils_1.classNames("charticulator__widget-control-input-image", ["is-none", isNone], ["is-drag-over", this.state.dragOver]), ref: (e) => (this.element = e), onDragEnter: this.handleDragEnter, onDragLeave: this.handleDragLeave, onDragOver: this.handleDragOver, onDrop: this.handleDrop, onClick: this.startChooseImage }, this.state.dragOver ? (React.createElement("div", { style: { width: "100%" } },
            this.props.label ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle, style: { padding: 0 } }, this.props.label)) : null,
            React.createElement("span", { className: "el-drag-over-attrubutes" }, strings_1.strings.objects.image.dropImage))) : (React.createElement("div", { style: { width: "100%" } },
            this.props.label ? (React.createElement(react_1.Label, { styles: fluentui_customized_components_1.defaultLabelStyle, style: { padding: 0 } }, this.props.label)) : null,
            React.createElement(fluentui_customized_components_1.FluentActionButton, { style: { width: "100%", height: fluentui_customized_components_1.defultBindButtonSize.height } },
                React.createElement(react_1.ActionButton, { styles: {
                        root: {
                            height: fluentui_customized_components_1.defultBindButtonSize.height,
                        },
                    }, text: isNone ? strings_1.strings.core.none : imageDisplayURL, iconProps: {
                        imageProps: {
                            src: isNone ? R.getSVGIcon("FileImage") : image.src,
                            style: {
                                height: "16px",
                                width: "16px",
                            },
                        },
                    } }))))));
    }
}
exports.InputImage = InputImage;
class ImageChooser extends context_component_1.ContextedComponent {
    render() {
        return (React.createElement("div", { className: "charticulator__image-chooser" },
            React.createElement(ImageUploader, { focusOnMount: true, onUpload: (images) => {
                    if (images.length == 1) {
                        this.props.onChoose({
                            src: images[0].dataURL,
                            width: images[0].width,
                            height: images[0].height,
                        });
                    }
                } })));
    }
}
exports.ImageChooser = ImageChooser;
class ImageUploader extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { dragOver: false };
        this.handleDragEnter = () => {
            this.setState({ dragOver: true });
        };
        this.handleDragLeave = () => {
            this.setState({ dragOver: false });
        };
        this.handleDragOver = (e) => {
            e.preventDefault();
        };
        this.handleDrop = (e) => {
            e.preventDefault();
            this.setState({ dragOver: false });
            if (e.dataTransfer.types.indexOf("text/uri-list") >= 0) {
                const uriList = e.dataTransfer.getData("text/uri-list");
                const uris = uriList
                    .replace(/\r/g, "")
                    .split("\n")
                    .map((x) => x.trim())
                    .filter((x) => !x.startsWith("#"));
                ImageUploader.ParseURIs(uris)
                    .then((r) => {
                    this.emitOnUpload(r);
                })
                    .catch((e) => {
                    this.showError(e);
                });
            }
            if (e.dataTransfer.files.length > 0) {
                ImageUploader.ParseFiles(e.dataTransfer.files).then((r) => {
                    this.emitOnUpload(r);
                });
            }
        };
        this.handlePaste = (e) => {
            if (e.clipboardData.files.length > 0) {
                e.preventDefault();
                ImageUploader.ParseFiles(e.clipboardData.files)
                    .then((r) => {
                    this.emitOnUpload(r);
                })
                    .catch((e) => {
                    this.showError(e);
                });
            }
        };
        this.handleOpenFile = () => {
            const inputFile = document.createElement("input");
            inputFile.setAttribute("type", "file");
            inputFile.onchange = () => {
                if (inputFile.files.length > 0) {
                    ImageUploader.ParseFiles(inputFile.files).then((r) => {
                        this.emitOnUpload(r);
                    });
                }
            };
            inputFile.click();
        };
        this.handleClearFile = () => {
            if (this.props.onClear) {
                this.props.onClear();
            }
        };
    }
    componentDidMount() { }
    componentWillUnmount() { }
    static ReadFileAsImage(name, file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        name,
                        width: img.width,
                        height: img.height,
                        dataURL: reader.result,
                    });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }
    static ParseFiles(files) {
        const result = [];
        const readFile = (file) => {
            result.push(this.ReadFileAsImage(file.name, file));
        };
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            readFile(file);
        }
        return Promise.all(result);
    }
    static ParseURIs(uris) {
        return Promise.all(uris.map((uri) => fetch(uri)
            .then((result) => result.blob())
            .then((blob) => {
            return new Promise((resolve, reject) => {
                if (!blob.type.startsWith("image/")) {
                    reject(new Error("not an image"));
                }
                else {
                    // TODO check changes
                    resolve(this.ReadFileAsImage("blob", blob));
                }
            });
        })));
    }
    // eslint-disable-next-line
    showError(error) {
        // FIXME: ignore error for now
    }
    emitOnUpload(result) {
        if (this.props.onUpload) {
            this.props.onUpload(result);
        }
    }
    render() {
        return (React.createElement("div", { className: "charticulator__image-uploader", ref: (e) => (this.refContainer = e), onDragEnter: this.handleDragEnter, onDragLeave: this.handleDragLeave, onDragOver: this.handleDragOver, onDrop: this.handleDrop }, this.state.dragOver ? (React.createElement(styles_1.ImageMappingDragStateWrapper, null, strings_1.strings.objects.image.dropImage)) : (React.createElement("span", { className: "el-input-wrapper" },
            React.createElement(react_1.TextField, { value: this.props.placeholder ||
                    strings_1.strings.objects.image.defaultPlaceholder, disabled: true, styles: styles_1.ImageMappingTextFieldStyles, onPaste: this.handlePaste }),
            React.createElement(fluentui_customized_components_1.FluentButton, { marginTop: "0px" },
                React.createElement(react_1.DefaultButton, { styles: {
                        root: Object.assign(Object.assign({ minWidth: "unset" }, fluentui_customized_components_1.defultBindButtonSize), { marginLeft: 5 }),
                    }, iconProps: {
                        iconName: "OpenFolderHorizontal",
                    }, onClick: this.handleOpenFile }))))));
    }
}
exports.ImageUploader = ImageUploader;
class InputImageProperty extends InputImage {
    render() {
        const isNone = this.props.value == null;
        const image = isNone ? null : this.resolveImage(this.props.value);
        let imageDisplayURL = image ? image.name : null;
        if (imageDisplayURL) {
            if (imageDisplayURL.startsWith("data:")) {
                imageDisplayURL = "(data url)";
            }
        }
        return (React.createElement("span", { className: utils_1.classNames("charticulator__widget-control-input-image", ["is-none", isNone], ["is-drag-over", this.state.dragOver]), ref: (e) => (this.element = e), onDragEnter: this.handleDragEnter, onDragLeave: this.handleDragLeave, onDragOver: this.handleDragOver, onDrop: this.handleDrop }, this.state.dragOver ? (React.createElement("span", { className: "el-drag-over" }, strings_1.strings.objects.image.dropImage)) : ([
            React.createElement(react_1.Image, { key: "image", src: isNone ? R.getSVGIcon("FileImage") : image.src, width: 30, height: 30 }),
            React.createElement(ImageUploader, { key: 0, placeholder: isNone ? strings_1.strings.core.none : imageDisplayURL, focusOnMount: true, onUpload: (images) => {
                    if (images.length == 1) {
                        if (this.props.onChange) {
                            this.props.onChange({
                                src: images[0].dataURL,
                                width: images[0].width,
                                height: images[0].height,
                                name: images[0].name,
                            });
                        }
                    }
                } }),
        ])));
    }
}
exports.InputImageProperty = InputImageProperty;
//# sourceMappingURL=fluentui_image.js.map