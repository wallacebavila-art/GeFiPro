import { PAGE_TITLES } from "../../constants.js";

export default function Topbar({ curPage }) {
  return (
    <div id="topbar">
      <span className="tb-title" id="topbar-title">
        {PAGE_TITLES[curPage] || curPage}
      </span>
    </div>
  );
}
