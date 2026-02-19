const TaskDistributionCard = ({ taskDistribution = [], tasks = 0, onViewAll }) => (
  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Task Status Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Distribution across all tasks</p>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        >
          View All Tasks
        </button>
      )}
    </div>

    <div className="space-y-5">
      {taskDistribution?.length > 0 ? taskDistribution.map((item) => {
        const count = Number(item.count) || 0;
        const total = Number(tasks) || 0;
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        return (
          <div key={item.status}>
            <div className="flex justify-between mb-1">
              <span className="capitalize text-gray-700 font-medium">
                {item.status.replace('_', ' ')}
              </span>
              <span className="text-gray-900 font-bold">{percentage}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  item.status === 'completed' ? 'bg-green-500' :
                  item.status === 'in_progress' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      }) : (
        <div className="text-center py-8 text-gray-500">No task data available</div>
      )}
    </div>
  </div>
);

export default TaskDistributionCard;
