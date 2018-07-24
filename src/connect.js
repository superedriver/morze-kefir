import React from "react";

import { handleError } from "./helpers";

export default (streamsToProps, ComponentToWrap) => {
  class Container extends React.Component {
    constructor() {
      super();

      this.state = {};
    }

    componentWillMount() {
      this.sb = streamsToProps.observe(data => {
        this.setState(data)
      }, handleError);
    }

    componentWillUnmount() {
      this.sb.unsubscribe();
    }

    render() {
      const props = {
        ...this.props,
        ...this.state
      };

      return React.createElement(ComponentToWrap, props, this.props.children)
    }
  }

  return Container
};
