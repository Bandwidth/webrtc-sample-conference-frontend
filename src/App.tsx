import React, {useState} from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import SettingsIcon from "@material-ui/icons/Settings";

import { setAudioAndVideoDevice } from './services/local-devices';

import Settings from "./Settings";
import Conferences from "./Conferences";
import Conference from "./Conference";
import Splash from "./Splash";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    overflow: "hidden"
  },
  appBar: {
    color: "#000",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(5px)"
  },
  container: {
    display: "flex",
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    marginTop: theme.spacing(3)
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [settingsModalOn, setSettingsModalOn] = useState(false);
  const handleSettingsSubmit = (selectedVideoDevice: MediaDeviceInfo | undefined, selectedAudioDevice: MediaDeviceInfo | undefined): void => {
    console.log(selectedVideoDevice)
    console.log(selectedAudioDevice)
    setAudioAndVideoDevice(selectedAudioDevice, selectedVideoDevice);
    setSettingsModalOn(false);
  }
  return (
    <Grid container direction="column" className={classes.root}>
      <Router>
        <Route exact path="/">
          <div>
            <Settings show={settingsModalOn} onSubmit={handleSettingsSubmit} />
            <Splash />
            <AppBar position="static" className={classes.appBar}>
              <Toolbar>
                <Typography variant="h6" className={classes.title}>
                  Bandwidth Web Conferencing
                </Typography>
                <div>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <IconButton
                    aria-label="settings for current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={() => {
                      setSettingsModalOn(true);
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </div>
              </Toolbar>
            </AppBar>
          </div>
        </Route>

        <Container className={classes.container}>
          <Grid
            container
            spacing={3}
            direction="column"
            justify="space-evenly"
            alignItems="flex-end"
            className={classes.content}
          >
            <Route exact path="/">
              <Grid item xs={4} />
              <Grid item xs={4}>
                <Conferences />
              </Grid>
              <Grid item xs={4} />
            </Route>
            <Route
              exact
              path="/:slug"
              children={
                <Grid item xs={12}>
                  <Conference />
                </Grid>
              }
            ></Route>
          </Grid>
        </Container>
      </Router>
    </Grid>
  );
};

export default App;
