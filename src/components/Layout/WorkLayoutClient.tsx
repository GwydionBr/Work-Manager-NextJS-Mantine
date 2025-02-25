// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Flex, Grid, Stack } from '@mantine/core';
// import * as actions from '@/actions';
// import ProjectNavbar from '@/components/Navbar/ProjectNavbar';
// import TimeTrackerComponent from '@/components/TimeTracker/TimeTrackerComponent';
// import type { Tables } from '@/types/db.types';


// export default function WorkLayoutClient({
//   children,
//   projects,
// }: {
//   children: any;
//   projects: Tables<'timerProject'>[];
// }) {
//   const router = useRouter();
//   const [projectList, setProjectList] = useState(projects);



//   return (
//     <Grid justify="space-between">
//       <Grid.Col span={2}>
//         <ProjectNavbar projects={projectList} />
//       </Grid.Col>
//       <Grid.Col span={6} p={40}>
//         <Flex justify="center">{children}</Flex>
//       </Grid.Col>
//       <Grid.Col span={3}>
//         <Flex
//           direction="column"
//           justify="center"
//           style={{ height: '100vh', position: 'fixed', right: 20 }}
//         >
//           <TimeTrackerComponent />
//         </Flex>
//       </Grid.Col>
//     </Grid>
//   );
// }