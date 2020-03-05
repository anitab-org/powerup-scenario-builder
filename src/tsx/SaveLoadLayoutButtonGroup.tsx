/**
 * @file SaveLoadLayoutButtonGroup.tsx
 * @author justKD
 * @fileoverview `export const SaveLoadLayoutButtonGroup`
 * Displays the save, load, and layout buttons in a group.
 * Responsive for large windows.
 */

import * as React from "react";

import { ButtonGroup, Button } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import PublishIcon from "@material-ui/icons/Publish";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import { diagramToolbar } from "../js/diagram.toolbar";

export const SaveLoadLayoutButtonGroup = (): JSX.Element => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        zIndex: 100,
        [theme.breakpoints.up("sm")]: {
          display: "block",
        },
        [theme.breakpoints.down("sm")]: {
          display: "none",
        },
      },
    }),
  );
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ButtonGroup variant="contained">
        <Button startIcon={<GetAppIcon />} onClick={diagramToolbar.save}>
          Save
        </Button>
        <Button startIcon={<ViewModuleIcon />} onClick={diagramToolbar.layout}>
          Layout
        </Button>
        <Button startIcon={<PublishIcon />} onClick={diagramToolbar.load}>
          Load
        </Button>
      </ButtonGroup>
    </div>
  );
};
