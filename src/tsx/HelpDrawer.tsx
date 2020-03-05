/**
 * @file HelpDrawer.tsx
 * @author justKD
 * @fileoverview `export const HelpDrawer`
 * Left-side slide out drawer holding use information. Toggled via
 * the ? button on the toolbar. Can also be closed with an arrow at
 * the top of the panel.
 */

import * as React from "react";
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const drawerWidth = 375;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    hide: {
      display: "none",
    },
    drawer: {
      zIndex: Number.MAX_SAFE_INTEGER - 10,
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  }),
);

export const HelpDrawer = ({ isOpen }: { isOpen: boolean }): JSX.Element => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  // eslint doesnt like this but it's fine
  React.useEffect(() => {
    setOpen(!open);
  }, [isOpen]);

  const content = {
    "Quick Guide": [
      "If an answer should end a scenario, you must click and edit the NextQID property manually.",
      "Set it to a negative integer to launch a mini-game. (e.g. minesweeper game is -1, tile matching is -2, etc.)",
      "Setting the NextQID to a $ will end the scenario with no mini-game.",
    ],
    "More Instructions": [
      "Click and drag in white space to pan the map.",
      "Middle mouse wheel or touch pad zoom gestures to zoom.",
      "Double click on any non-italic text to edit it.",
      "Make sure to set the ScenarioID. All other question nodes will inherit it, and it will give a numbered namespace for Q&A IDs.",
      "Click the + icon to add a new node. It will automatically number the connecting properties (NextQID or QuestionID).",
      "The text at the top of each node is the actual question or answer text.",
    ],
    Toolbar: [
      "Save · download a JSON file to your local download folder. This is the data representing your current scenario layout.",
      "Open · Select a previously saved JSON file to load your work.",
      "Layout · re-organize your tree if things get messy.",
      "Export Answers · download a CSV file. This file contains all of the records and fields ready to be copy/pasted into the main database.",
      "Export Questions · same as above but for Questions.",
      "Export SVG · Download an editable SVG of your current layout. Great for making posters for your wall.",
      "Export PDF · Download a PDF of your current layout. Great for sharing with your friends.",
    ],
    "Nodes and Links": [
      "You can click on nodes or links to select them.",
      "Select something and hit your delete key to delete it.",
      "Disconnected nodes can be re-routed, and their connecting properties will update.",
      "The app will not allow links that would create a potential infinite loop.",
      "Questions can have multiple Answers on either side.",
      "But Answers can only have one Question in and one Question out.",
    ],
  };

  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <h2>Powerup Scenario Builder</h2>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          {Object.keys(content).map((key, index) => (
            <div key={`div-${key}-${index}`}>
              <h3 key={`h2-${key}-${index}`}>{key}</h3>
              {(content as any)[key].map((text: any, jindex: any) => {
                return (
                  <div key={`div-inner-${key}-${index}-${jindex}`}>
                    <ListItem key={`li-${key}-${index}-${jindex}`}>
                      <ListItemText
                        key={`li-text-${key}-${index}-${jindex}`}
                        primary={text}
                      />
                    </ListItem>
                  </div>
                );
              })}
              <Divider />
            </div>
          ))}
        </List>
      </Drawer>
    </div>
  );
};
