// routes/dashboard.projects._index.tsx

const projects = [
  {
    name: "Project 1",
    date: "2023-01-01",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus libero, recusandae est quidem adipisci rerum sapiente doloremque nam!",
  },
  {
    name: "Project 2",
    date: "2023-02-01",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus libero, recusandae est quidem adipisci rerum sapiente doloremque nam!",
  },
  {
    name: "Project 3",
    date: "2023-03-01",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus libero, recusandae est quidem adipisci rerum sapiente doloremque nam!",
  },
  {
    name: "Project 4",
    date: "2023-04-01",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus libero, recusandae est quidem adipisci rerum sapiente doloremque nam!",
  },
]

export default function ProjectsIndex() {
  return (
    <div className="grid md:grid-cols-3 grid-cols-2 gap-3.5">
      {projects.map((project) => (
        <div key={project.name} className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 py-3 px-3.5 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none flex flex-col justify-between">
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <p className="text-xs dark:text-muted-foreground mb-2.5 font-medium">{project.date}</p>
          <p className="text-sm mb-1.5">{project.description}</p>
        </div>
      ))}
      <div>
        {/* Create new project button or card */}
      </div>
    </div>
  );
}