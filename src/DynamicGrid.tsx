import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    position: "absolute",
    flexWrap: "wrap",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c0a14",
    overflow: "hidden",
    justifyContent: "center",
    flexDirection: "column",
  },
  child: {
    display: "flex",
    backgroundColor: "#1c0a14",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },
}));

export interface DynamicGridProps {
  selectedIndex?: number | null;
}

const DynamicGrid: React.FC<DynamicGridProps> = (props) => {
  const classes = useStyles();
  const childrenCount = React.Children.count(props.children);
  const gridWidth = Math.ceil(Math.sqrt(childrenCount));
  const gridHeight = Math.round(Math.sqrt(childrenCount));
  const spotlightMode =
    props.selectedIndex !== undefined && props.selectedIndex !== null;

  const normalStyle = () => {
    return {
      width: `${100 / gridWidth}%`,
      height: `${100 / gridHeight}%`,
    };
  };

  const spotlightStyle = () => {
    return {
      width: `85%`,
      height: `100%`,
      order: -1,
    };
  };

  const thumbnailStyle = () => {
    return {
      width: `15%`,
      height: `15%`,
    };
  };

  const getStyle = (index: number) => {
    if (!spotlightMode) {
      return normalStyle();
    } else if (index === props.selectedIndex) {
      return spotlightStyle();
    } else {
      return thumbnailStyle();
    }
  };

  return (
    <div className={classes.root}>
      {React.Children.map(props.children, (child, index) => {
        return (
          <div className={classes.child} style={getStyle(index)}>
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicGrid;
