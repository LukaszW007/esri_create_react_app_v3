import React from "react";
import "./RadioButton.css";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from "@material-ui/core/Switch";

class RadioButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSwitchOn: false,
    };
    this.handleSwitch = this.handleSwitch.bind(this);
  }

  handleSwitch(e) {

    this.setState(prevState => ({
      isSwitchOn: !prevState.isSwitchOn}));
    console.log(`switched ${JSON.stringify(this.state)}`);
    this.props.onSwitchHandler(this.state.isSwitchOn);

      console.log(`switched after handleSwitch ${JSON.stringify(this.state)}`);
  }

  render() {
    return (
      <FormControlLabel className="formControlLabel"
        control={<Switch checked={this.state.isSwitchOn} onChange={this.handleSwitch}/>}
        label="3D/2D"
      />
    );
  }
}

export default RadioButton;
