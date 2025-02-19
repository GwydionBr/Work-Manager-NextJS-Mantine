interface ProjectProps {
  params: {
    projectId: string;
  };
}

export default async function Project({ params }: ProjectProps) {
  return (
    <>
      <div>{params.projectId}</div>
    </>
  );
}