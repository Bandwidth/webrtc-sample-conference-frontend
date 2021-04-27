import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { Button, Paper, Typography, Grid, TextField } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

const ENTER_KEY_CODE = 13;
const backendUrl = '';

const useStyles = makeStyles(theme =>
  createStyles({
    root: { flexGrow: 1 },
    paper: {
      borderRadius: "20px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(5px)",
      padding: theme.spacing(4, 7),
      boxShadow: "0px 4px 20px rgba(0,0,0,0.5)"
    },
    container: {
      display: "flex",
      justifyContent: "center",
    },
    button: {
      backgroundColor: "#fff"
    }
  })
);

const Conferences: React.FC = () => {
  const classes = useStyles();
  const [conferenceName, setConferenceName] = useState<string>("");
  const [redirectTo, setRedirectTo] = useState<string>();

  const createConference = async () => {
    console.log(`Creating conference: ${conferenceName}`)
    let resp = await fetch(`${backendUrl}/conferences`, {
      method: "POST",
      body: JSON.stringify({ name: conferenceName }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (resp.ok) {
      const body = await resp.json();
      setRedirectTo(`/${body.slug}`);
    } else {
      const error = await resp.text();
      console.log(`Error creating conference, status=${resp.status}, message=${error}`);
    }
  };

  return (
    <Paper className={classes.paper}>
      <Grid container className={classes.root} direction="column" spacing={3}>
        <Grid item>
          <Typography variant="h6">Create or Join a Conference</Typography>
        </Grid>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <TextField 
              id="conferenceName"
              variant="filled"
              size="small"
              label="Name"
              placeholder="Optional"
              autoFocus={true}
              value={conferenceName}
              onChange={e => setConferenceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.keyCode === ENTER_KEY_CODE) {
                  createConference();
                }
              }}
            />
          </Grid>
          <Grid item>
            <Button
              id="createNewConferenceButton"
              variant="contained"
              onClick={createConference}
              className={classes.button}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {redirectTo != null ? (
        <Redirect to={redirectTo}></Redirect>
      ) : (
        undefined
      )}
    </Paper>
  );
};

export default Conferences;
