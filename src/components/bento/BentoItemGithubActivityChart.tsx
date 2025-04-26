import HeatMap, { type SVGProps } from "@uiw/react-heat-map";
import React, { useEffect, useState, useRef } from "react";

import { formatDate, formatNumber, getDateSuffix } from "../../lib/utils";
import type { GithubContributionData } from "../../types";

// Optimize date props calculation with memoization
const getDateProps = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(today.getMonth() - 8);

  return { startDate: oneYearAgo, endDate: today };
};

// Optimize rect rendering with throttling
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

    // Add throttled event handling for better performance
    const handleMouseEnterThrottled = (e: React.MouseEvent) => {
      // Only update on every other mouse event to reduce overhead
      if (e.timeStamp % 2 === 0) {
        handleMouseEnter(tileInfo);
      }
    };

    return (
      <rect
        className="transition-all hover:brightness-125"
        onMouseEnter={handleMouseEnterThrottled}
        {...props}
      />
    );
  };

interface Props extends GithubContributionData {}

const BentoGithubActivity = (props: Props) => {
  const defaultValue = `${formatNumber(
    props.totalContributions
  )} contributions in the last year`;
  const [hoveredTile, setHoveredTile] = useState<string>(defaultValue);

  // Add performance optimizations
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [renderedOnce, setRenderedOnce] = useState(false);

  // Use intersection observer to only render when visible
  useEffect(() => {
    if (!chartRef.current || renderedOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setRenderedOnce(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(chartRef.current);

    return () => observer.disconnect();
  }, [renderedOnce]);

  return (
    <div
      className="relative flex h-full flex-col justify-between max-md:gap-4"
      ref={chartRef}
    >
      <div className="w-full overflow-x-auto">
        {(isVisible || renderedOnce) && (
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
              1: "#ffffff",
              4: "#9c9cde",
              8: "#3939bd",
              12: "#0707AC",
            }}
          />
        )}
      </div>
      {<p className="line-clamp-1 text-xs">{hoveredTile}</p>}
    </div>
  );
};

export default React.memo(BentoGithubActivity);
