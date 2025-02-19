// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */

import * as React from "react";
import { classNames } from "../../utils";
import { DefaultButton } from "@fluentui/react";

export interface PanelRadioControlProps {
  options: string[];
  icons?: string[];
  labels?: string[];
  showText?: boolean;
  asList?: boolean;
  value?: string;
  onChange?: (newValue: string) => void;
}

export class PanelRadioControl extends React.Component<
  PanelRadioControlProps,
  {}
> {
  public render() {
    const mainClass = this.props.asList
      ? "charticulator-panel-list-view"
      : "charticulator-panel-list-view is-inline";
    return (
      <span className={mainClass}>
        {this.props.options.map((option, index) => {
          return (
            <DefaultButton
              className={classNames("el-item", [
                "is-active",
                this.props.value == option,
              ])}
              key={option}
              onClick={() => {
                if (this.props) {
                  this.props.onChange(option);
                }
              }}
              iconProps={
                this.props.icons
                  ? {
                      iconName: this.props.icons[index],
                    }
                  : null
              }
              text={
                this.props.labels && this.props.showText
                  ? this.props.labels[index]
                  : null
              }
            />
          );
        })}
      </span>
    );
  }
}
