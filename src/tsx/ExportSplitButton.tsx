/**
 * @file ExportSplitButton.tsx
 * @author justKD
 * @fileoverview `export const ExportSplitButton`
 * MaterialUI button group as a split button. Handles functionality
 * for exporting files from the app.
 */

import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import { diagramToolbar } from "../js/diagram.toolbar";

const options = [
  "Export Answers",
  "Export Questions",
  "Export SVG",
  "Export PDF",
];

export const ExportSplitButton = (): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    switch (selectedIndex) {
      case 0:
        diagramToolbar.exportCSV(0);
        break;
      case 1:
        diagramToolbar.exportCSV(1);
        break;
      case 2:
        diagramToolbar.exportSVG();
        break;
      case 3:
        diagramToolbar.exportPDF();
        break;
      default:
    }
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <div
      style={{
        zIndex: 100,
      }}
    >
      <Grid container direction="column" alignItems="center">
        <Grid item xs={12}>
          <ButtonGroup
            variant="contained"
            ref={anchorRef}
            aria-label="export split button"
          >
            <Button onClick={handleClick}>{options[selectedIndex]}</Button>
            <Button
              size="small"
              aria-controls={open ? "split-button-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-label="select export strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="export-split-button-menu">
                      {options.map((option, index) => (
                        <MenuItem
                          key={option}
                          selected={index === selectedIndex}
                          onClick={event => handleMenuItemClick(event, index)}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Grid>
      </Grid>
    </div>
  );
};
