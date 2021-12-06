// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import * as React from "react";
import { AppStore } from "../../stores";
import { stringToDataURL } from "../../utils";

export class PageView extends React.PureComponent<
  { store: AppStore },
  { svgDataURL: string }
> {
  constructor(props: { store: AppStore }) {
    super(props);
    this.state = {
      svgDataURL: null,
    };
    this.renderImage();
    this.props.store.addListener(AppStore.EVENT_GRAPHICS, () => {
      this.renderImage();
    });
  }
  public async renderImage() {
    const svg = await this.props.store.renderLocalSVG();
    this.setState({
      svgDataURL: stringToDataURL("image/svg+xml", svg),
    });
  }
  public render() {
    return <img src={this.state.svgDataURL} className={"full_size"} />;
  }
}
