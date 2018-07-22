import Kefir from "kefir";
import React from "react";

import {
  handleError,
  reduceProperties,
} from "./helpers";

export default (streamsToProps, ComponentToWrap) => {
  class Container extends React.Component {
    constructor(props) {
      super(props);

      this.state = {};

      Container.constructor$.plug(Kefir.constant(props))
    }

    componentWillMount(...args) {
      const props$ = Kefir.combine(streamsToProps);

      this.sb = props$.observe(data => {
        const state = reduceProperties(data);
        this.setState(state)
      }, handleError);

      Container.willMount$.plug(Kefir.constant(args))
    }

    componentWillUnmount(...args) {
      this.sb.unsubscribe();

      Container.willUnmount$.plug(Kefir.constant(args))
    }

    render() {
      const props = {
        ...this.props,
        ...this.state
      };

      return React.createElement(ComponentToWrap, props, this.props.children)
    }
  }

  Container.constructor$ = Kefir.pool();
  Container.willMount$ = Kefir.pool();
  Container.willUnmount$ = Kefir.pool();

  return Container
};

