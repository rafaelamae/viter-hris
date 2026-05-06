import React from "react";
import Layout from "../Layout";
import { StoreContext } from "../../../store/StoreContext";
import useQueryData from "../../../functions/custom-hooks/useQueryData";
import { apiVersion } from "../../../functions/functions-general";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaUserFriends,
  FaBuilding,
  FaBirthdayCake,
  FaTrophy,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { MdCelebration } from "react-icons/md";

// ─── helpers ────────────────────────────────────────────────────────────────

const getInitials = (firstName = "", lastName = "") => {
  const f = firstName.trim().split(" ")[0]?.[0] ?? "";
  const l = lastName.trim().split(" ")[0]?.[0] ?? "";
  return (f + l).toUpperCase();
};

const Avatar = ({ firstName, lastName, size = "md" }) => {
  const initials = getInitials(firstName, lastName);
  const sizeClasses = {
    sm: "min-w-[2rem] min-h-[2rem] max-w-[2rem] max-h-[2rem] text-xs",
    md: "min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] text-sm",
    lg: "min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] text-base",
  };
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary text-white font-semibold uppercase ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  );
};

const isBirthdayToday = (birthday) => {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return (
    bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()
  );
};

const isBirthdayThisMonth = (birthday) => {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return (
    bday.getMonth() === today.getMonth() && bday.getDate() !== today.getDate()
  );
};

const isAnniversaryThisMonth = (startDate) => {
  if (!startDate) return false;
  const today = new Date();
  const start = new Date(startDate);
  return (
    start.getMonth() === today.getMonth() &&
    start.getFullYear() < today.getFullYear()
  );
};

const isNewEmployeeThisMonth = (startDate) => {
  if (!startDate) return false;
  const today = new Date();
  const start = new Date(startDate);
  return (
    start.getMonth() === today.getMonth() &&
    start.getFullYear() === today.getFullYear()
  );
};

const getYearsOfService = (startDate) => {
  const today = new Date();
  const start = new Date(startDate);
  return today.getFullYear() - start.getFullYear();
};

// ─── Section Card Shell ──────────────────────────────────────────────────────

const SectionCard = ({ icon: Icon, title, children, className = "" }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
  >
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
      <Icon className="text-primary text-base" />
      <h2 className="text-sm font-bold text-primary">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Loading Skeleton ────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-2">
    <div className="rounded-full bg-gray-100 min-w-[2.5rem] min-h-[2.5rem]" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-2 bg-gray-50 rounded w-1/2" />
    </div>
  </div>
);

// ─── Announcements (reads memo module) ───────────────────────────────────────

const WhosOut = () => (
  <SectionCard icon={FaCalendarAlt} title="Who's Out">
    <div className="py-4 text-center">
      <p className="text-xs text-gray-400">No one is out today.</p>
    </div>
  </SectionCard>
);

const AnnouncementItem = ({ item }) => {
  const [expanded, setExpanded] = React.useState(false);
  const preview = item.memo_text?.substring(0, 180);
  const hasMore = item.memo_text?.length > 180;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-center min-w-[2rem] min-h-[2rem] mt-0.5">
        <FaBullhorn className="text-primary text-xs" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 leading-snug">
          {item.memo_category}
        </p>
        <p className="text-xs text-gray-400 mb-1">Date: {item.memo_date}</p>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
          {expanded ? item.memo_text : preview}
          {hasMore && !expanded && "..."}
        </p>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
          >
            {expanded ? (
              <>
                Show less <FaChevronUp className="text-[10px]" />
              </>
            ) : (
              <>
                Read more <FaChevronDown className="text-[10px]" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Announcements = () => {
  const {
    data: result,
    isLoading,
    isError,
  } = useQueryData(
    `${apiVersion}/controllers/developers/memo/page.php?start=1`,
    "post",
    "memo-dashboard",
    { filterData: "1", searchValue: "" }
  );

  const memos = result?.data ?? [];

  return (
    <SectionCard icon={FaBullhorn} title="Announcement">
      <div className="max-h-[340px] overflow-y-auto pr-1">
        {isLoading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
        {isError && (
          <p className="text-xs text-red-500 py-4 text-center">
            Failed to load announcements.
          </p>
        )}
        {!isLoading && !isError && memos.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            No announcements at this time.
          </p>
        )}
        {memos.map((item) => (
          <AnnouncementItem key={item.memo_aid} item={item} />
        ))}
      </div>
    </SectionCard>
  );
};

// ─── Celebrations (reads employee_birthday + employee_start_work_date) ────────

const Celebrations = () => {
  const {
    data: result,
    isLoading,
    isError,
  } = useQueryData(
    `${apiVersion}/controllers/developers/employees/page.php?start=1`,
    "post",
    "employees-celebrations",
    { filterData: "1", searchValue: "" }
  );

  const employees = result?.data ?? [];

  const todayBdays = employees.filter((e) =>
    isBirthdayToday(e.employee_birthday)
  );
  const monthBdays = employees.filter((e) =>
    isBirthdayThisMonth(e.employee_birthday)
  );
  const anniversaries = employees.filter((e) =>
    isAnniversaryThisMonth(e.employee_start_work_date)
  );

  const hasAny =
    todayBdays.length > 0 ||
    monthBdays.length > 0 ||
    anniversaries.length > 0;

  return (
    <SectionCard icon={MdCelebration} title="Celebrations">
      {isLoading && <SkeletonRow />}
      {isError && (
        <p className="text-xs text-red-500 text-center py-2">
          Failed to load.
        </p>
      )}
      {!isLoading && !isError && !hasAny && (
        <div className="text-center py-4">
          <MdCelebration className="text-4xl text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-500 leading-relaxed">
            No celebration for today. However, we would like to express our
            sincere appreciation and gratitude for all the hard work of our
            employees. You are the backbone of our company and we value your
            contributions immensely. Thank you for your understanding and
            cooperation.
          </p>
        </div>
      )}

      {todayBdays.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wide flex items-center gap-1 mb-1">
            <FaBirthdayCake /> Birthdays Today
          </p>
          {todayBdays.map((e) => (
            <div
              key={e.employee_aid}
              className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
            >
              <Avatar
                firstName={e.employee_first_name}
                lastName={e.employee_last_name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {e.employee_last_name}, {e.employee_first_name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {e.department_name ?? "--"}
                </p>
              </div>
            </div>
          ))}
        </>
      )}

      {monthBdays.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mt-3 mb-1">
            <FaBirthdayCake /> Birthdays This Month
          </p>
          {monthBdays.map((e) => {
            const d = new Date(e.employee_birthday);
            return (
              <div
                key={e.employee_aid}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <Avatar
                  firstName={e.employee_first_name}
                  lastName={e.employee_last_name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {e.employee_last_name}, {e.employee_first_name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {e.department_name ?? "--"}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 bg-yellow-50 text-yellow-700">
                  {d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </>
      )}

      {anniversaries.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mt-3 mb-1">
            <FaTrophy /> Work Anniversaries
          </p>
          {anniversaries.map((e) => {
            const yrs = getYearsOfService(e.employee_start_work_date);
            return (
              <div
                key={e.employee_aid}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <Avatar
                  firstName={e.employee_first_name}
                  lastName={e.employee_last_name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {e.employee_last_name}, {e.employee_first_name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {e.department_name ?? "--"}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 bg-green-50 text-green-700">
                  {yrs}yr{yrs !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </>
      )}
    </SectionCard>
  );
};

// ─── New Employees (employee_start_work_date this month) ─────────────────────

const NewEmployees = () => {
  const {
    data: result,
    isLoading,
    isError,
  } = useQueryData(
    `${apiVersion}/controllers/developers/employees/page.php?start=1`,
    "post",
    "employees-new",
    { filterData: "1", searchValue: "" }
  );

  const employees = result?.data ?? [];
  const newOnes = employees.filter((e) =>
    isNewEmployeeThisMonth(e.employee_start_work_date)
  );

  return (
    <SectionCard
      icon={FaBuilding}
      title="Welcome to Frontline Business Solutions Inc."
    >
      {isLoading && <SkeletonRow />}
      {isError && (
        <p className="text-xs text-red-500 text-center py-2">
          Failed to load.
        </p>
      )}
      {!isLoading && !isError && newOnes.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          No new employee yet.
        </p>
      )}
      <div className="space-y-1">
        {newOnes.map((emp) => (
          <div
            key={emp.employee_aid}
            className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
          >
            <Avatar
              firstName={emp.employee_first_name}
              lastName={emp.employee_last_name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {emp.employee_last_name}, {emp.employee_first_name}
              </p>
              <p className="text-[10px] text-gray-400">
                {emp.department_name ?? "—"}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {emp.employee_start_work_date
                ? new Date(emp.employee_start_work_date).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )
                : ""}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

// ─── My Team (all employees, grouped by department) ───────────────────────────

const MyTeam = () => {
  const {
    data: result,
    isLoading,
    isError,
  } = useQueryData(
    `${apiVersion}/controllers/developers/employees/page.php?start=1`,
    "post",
    "employees-team",
    { filterData: "1", searchValue: "" }
  );

  const employees = result?.data ?? [];

  const grouped = React.useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const dept = emp.department_name ?? "No Department";
      if (!map[dept]) map[dept] = [];
      map[dept].push(emp);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [employees]);

  return (
    <SectionCard icon={FaUserFriends} title="My Team">
      {isLoading && (
        <div className="space-y-2">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}
      {isError && (
        <p className="text-xs text-red-500 text-center py-4">
          Failed to load team.
        </p>
      )}
      {!isLoading && !isError && grouped.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          No employees found.
        </p>
      )}
      <div className="space-y-5">
        {grouped.map(([dept, members]) => (
          <div key={dept}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
              {dept}
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((emp) => (
                <div
                  key={emp.employee_aid}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-md px-3 py-1.5"
                >
                  <Avatar
                    firstName={emp.employee_first_name}
                    lastName={emp.employee_last_name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                      {emp.employee_first_name.split(" ")[0]}{" "}
                      {emp.employee_last_name.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-gray-400">{dept}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

// ─── Dashboard Root ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { store } = React.useContext(StoreContext);
  const firstName =
    store?.credentials?.data?.user_first_name ?? "Emmanuel";
  const lastName = store?.credentials?.data?.user_last_name ?? "Manalo";

  return (
    <Layout menu="dashboard">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-2 mb-5">
        <h1 className="text-xl font-bold text-dark">
          Welcome {lastName}, {firstName}!
        </h1>
      </div>

      {/* TOP ROW: Who's Out | Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 mb-4">
        <WhosOut />
        <Announcements />
      </div>

      {/* BOTTOM ROW: Left (Celebrations + New Employees) | My Team */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        <div className="flex flex-col gap-4">
          <Celebrations />
          <NewEmployees />
        </div>
        <MyTeam />
      </div>
    </Layout>
  );
};

export default Dashboard;
