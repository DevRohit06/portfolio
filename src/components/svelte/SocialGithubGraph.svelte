<script lang="ts">
  import { onMount } from "svelte";

  export let username = "devrohit06";

  type Day = { date: string; count: number; level: number };

  let columns: (Day | null)[][] = [];
  let monthLabels: { index: number; label: string }[] = [];
  let total = 0;
  let loading = true;
  let error = false;
  let hovered = "";

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Map the 0-4 contribution level to the site's GitHub activity CSS tokens.
  const levelVar = (lvl: number) =>
    lvl <= 0
      ? "var(--github-activity-level0)"
      : lvl === 1
        ? "var(--github-activity-level1)"
        : lvl === 2
          ? "var(--github-activity-level4)"
          : lvl === 3
            ? "var(--github-activity-level8)"
            : "var(--github-activity-level12)";

  const pretty = (d: Day) => {
    const label = new Date(d.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const n = d.count;
    return `${n === 0 ? "No" : n} contribution${n === 1 ? "" : "s"} on ${label}`;
  };

  async function load() {
    try {
      loading = true;
      error = false;
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();

      const contribs: Day[] = data.contributions ?? [];
      if (contribs.length === 0) throw new Error("no data");

      total =
        data.total?.lastYear ??
        contribs.reduce((a: number, c) => a + (c.count || 0), 0);

      // Pad the leading days so the first column starts on Sunday.
      const lead = new Date(contribs[0].date).getDay();
      const cells: (Day | null)[] = [];
      for (let i = 0; i < lead; i++) cells.push(null);
      for (const c of contribs) cells.push(c);

      const cols: (Day | null)[][] = [];
      for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
      columns = cols;

      // First column of each new month gets a label.
      const labels: { index: number; label: string }[] = [];
      let prevMonth = -1;
      cols.forEach((col, i) => {
        const firstDay = col.find((d) => d) as Day | undefined;
        if (!firstDay) return;
        const m = new Date(firstDay.date).getMonth();
        if (m !== prevMonth) {
          labels.push({ index: i, label: MONTHS[m] });
          prevMonth = m;
        }
      });
      monthLabels = labels;

      hovered = `${total.toLocaleString()} contributions in the last year`;
      loading = false;
    } catch (e) {
      error = true;
      loading = false;
    }
  }

  onMount(load);
</script>

<div class="gh">
  {#if loading}
    <div class="gh-state">Loading contributions…</div>
  {:else if error}
    <div class="gh-state">
      Couldn't load GitHub activity.
      <button class="gh-retry" on:click={load}>Retry</button>
    </div>
  {:else}
    <div class="gh-scroll">
      <div class="gh-inner">
        <div class="gh-months">
          {#each monthLabels as m}
            <span class="gh-month" style={`grid-column: ${m.index + 1}`}>{m.label}</span>
          {/each}
        </div>

        <div
          class="gh-cells"
          on:mouseleave={() =>
            (hovered = `${total.toLocaleString()} contributions in the last year`)}
        >
          {#each columns as col}
            {#each col as day}
              <div
                class="gh-cell"
                style={`background:${day ? levelVar(day.level) : "transparent"}`}
                role="img"
                aria-label={day ? pretty(day) : "No data"}
                title={day ? pretty(day) : ""}
                on:mouseenter={() => day && (hovered = pretty(day))}
              ></div>
            {/each}
          {/each}
        </div>
      </div>
    </div>

    <div class="gh-footer">
      <span class="gh-hint">{hovered}</span>
      <span class="gh-legend">
        Less
        <i style="background: var(--github-activity-level0)"></i>
        <i style="background: var(--github-activity-level1)"></i>
        <i style="background: var(--github-activity-level4)"></i>
        <i style="background: var(--github-activity-level8)"></i>
        <i style="background: var(--github-activity-level12)"></i>
        More
      </span>
    </div>
  {/if}
</div>

<style>
  .gh {
    width: 100%;
  }

  .gh-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: 90px;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .gh-retry {
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    font: inherit;
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    cursor: pointer;
  }

  .gh-retry:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }

  /* Mobile-first: fixed cells so the graph stays legible and scrolls sideways. */
  .gh-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }

  .gh-inner {
    --cell: 11px;
    --gap: 3px;
    width: max-content;
  }

  .gh-months {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: var(--cell);
    column-gap: var(--gap);
    margin-bottom: 4px;
    font-size: 10px;
    color: var(--text-secondary);
    overflow: hidden;
  }

  .gh-month {
    white-space: nowrap;
    line-height: 1;
  }

  .gh-cells {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, var(--cell));
    grid-auto-columns: var(--cell);
    gap: var(--gap);
  }

  .gh-cell {
    width: var(--cell);
    height: var(--cell);
    border-radius: 2px;
    outline: 1px solid transparent;
    transition:
      transform 0.15s ease,
      outline-color 0.15s ease;
  }

  .gh-cell:hover {
    transform: scale(1.35);
    outline-color: var(--accent-primary);
  }

  .gh-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 10px;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }

  .gh-hint {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gh-legend {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
  }

  .gh-legend i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  /* Larger screens: fill the card width instead of scrolling. */
  @media (min-width: 640px) {
    .gh-inner {
      width: 100%;
    }

    .gh-months {
      grid-auto-columns: 1fr;
    }

    .gh-cells {
      grid-template-rows: repeat(7, 1fr);
      grid-auto-columns: 1fr;
      gap: clamp(2px, 0.45vw, 3px);
    }

    .gh-cell {
      width: 100%;
      height: auto;
      aspect-ratio: 1 / 1;
    }
  }

  @media (max-width: 480px) {
    .gh-legend {
      display: none;
    }
  }
</style>
