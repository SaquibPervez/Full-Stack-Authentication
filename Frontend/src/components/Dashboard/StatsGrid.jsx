import StatCard from './StatCard';

const StatsGrid = ({ items = [], className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
    {items.map((item) => (
      <StatCard
        key={item.title}
        title={item.title}
        value={item.value}
        icon={item.icon}
        color={item.color}
      />
    ))}
  </div>
);

export default StatsGrid;
