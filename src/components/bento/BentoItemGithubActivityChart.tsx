import HeatMap, { type SVGProps } from "@uiw/react-heat-map";
import React from "react";

import { formatDate, formatNumber, getDateSuffix } from "../../lib/utils";
import type { GithubContributionData } from "../../types";

// import BentoBadge from "../BentoBadge";

const getDateProps = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(today.getMonth() - 6);

  return { startDate: oneYearAgo, endDate: today };
};

const renderRect =
  (handleMouseEnter: (date: string) => void): SVGProps["rectRender"] =>
  (props, data) => {
    const date = new Date(data.date);
    const formattedDate =
      date.toLocaleDateString("en-US", { day: "numeric", month: "long" }) +
      getDateSuffix(date.getDate());
    const tileInfo = `${
      data.count ? formatNumber(data.count) : "No"
    } contributions on ${formattedDate}`;

    return (
      <rect
        className="transition-all hover:brightness-125"
        onMouseEnter={() => handleMouseEnter(tileInfo)}
        {...props}
      />
    );
  };

interface Props extends GithubContributionData {}

const BentoGithubActivity = (props: Props) => {
  const defaultValue = `${formatNumber(
    props.totalContributions
  )} contributions in the last year`;
  const [hoveredTile, setHoveredTile] = React.useState<string | null>(
    defaultValue
  );

  return (
    <div className="relative  flex h-full flex-col justify-between  max-md:gap-4">
      <div className="flex items-baseline justify-between gap-4 max-xs:flex-col">
        {/* <BentoBadge icon={Github} text="Github activity" /> */}
        {/* <p className="line-clamp-1 text-sm">{hoveredTile}</p> */}
      </div>
      <div className="w-full overflow-x-auto">
        <HeatMap
          {...getDateProps()}
          onMouseLeave={() => setHoveredTile(defaultValue)}
          className="w-full"
          value={props.contributions ?? []}
          weekLabels={false}
          monthLabels={false}
          legendCellSize={0}
          space={4}
          style={{ color: "#fff" }}
          rectProps={{ rx: 4 }}
          rectSize={16}
          rectRender={renderRect((date) => setHoveredTile(date))}
          panelColors={{
            1: "rgba(220, 220, 220, 0.8)",
            4: "#0F4E43",
            8: "#1F977B",
            12: "#1EF4AE",
          }}
        />
      </div>
      {
        // <p className="text-sm text-slate-200 max-sm:text-xs sm:max-lg:mt-4">
        //   Last pushed on {formatDate(new Date(props.lastPushedAt))}
        // </p>
      }
    </div>
  );
};

export default BentoGithubActivity;
