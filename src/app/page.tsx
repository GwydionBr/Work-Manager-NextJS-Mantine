"use client";

import { useFormatter } from "@/hooks/useFormatter";

import classes from "./Home.module.css";
import {
  Text,
  Button,
  Stack,
  Box,
  Title,
  Container,
  SimpleGrid,
  Card,
  ThemeIcon,
} from "@mantine/core";
import Link from "next/link";
import {
  IconClock,
  IconUsers,
  IconChartBar,
  IconArrowRight,
} from "@tabler/icons-react";
import HomeHeader from "@/components/Home/HomeHeader";

export default function HomePage() {
  const { getLocalizedText } = useFormatter();

  const features = [
    {
      icon: <IconClock size={32} />,
      title: getLocalizedText("Zeiterfassung", "Time Tracking"),
      description: getLocalizedText(
        "Effizienter Tracken und Verwalten Ihrer Arbeitsstunden über verschiedene Projekte mit einer intuitiven Oberfläche.",
        "Efficiently track and manage your working hours across different projects with an intuitive interface."
      ),
    },
    {
      icon: <IconUsers size={32} />,
      title: getLocalizedText("Gruppenverwaltung", "Group Management"),
      description: getLocalizedText(
        "Organisieren Sie Teams und verwalten Sie gemeinsame Projekte und Ressourcen effektiv.",
        "Organize teams and manage shared projects and resources effectively."
      ),
    },
    {
      icon: <IconChartBar size={32} />,
      title: getLocalizedText("Finanzübersicht", "Financial Overview"),
      description: getLocalizedText(
        "Verwalten Sie Ihre Finanzen und Projektbudgets mit detaillierten Einblicken.",
        "Keep track of your finances and project budgets with detailed insights."
      ),
    },
  ];

  return (
    <Box className={classes.mainHomeContainer}>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <HomeHeader />
          {/* Hero Section */}
          <Box ta="center" py={80}>
            <Title
              order={1}
              size={48}
              mb="md"
              c="light-dark(var(--mantine-color-dark-7), var(--mantine-color-gray-2))"
            >
              {getLocalizedText(
                "Willkommen beim Work Manager",
                "Welcome to Work Manager"
              )}
            </Title>
            <Text size="xl" c="dimmed" maw={600} mx="auto" mb={40}>
              {getLocalizedText(
                "Ihre zentrale Plattform für effizientes Projektmanagement, Zeiterfassung und Finanzkontrolle. Optimieren Sie Ihre Arbeitsabläufe und steigern Sie Ihre Produktivität.",
                "Your central platform for efficient project management, time tracking, and financial control. Optimize your workflows and boost your productivity."
              )}
            </Text>
            <Button
              component={Link}
              href="/work"
              size="lg"
              className={classes.primaryButton}
              rightSection={<IconArrowRight size={20} />}
            >
              {getLocalizedText("Zur Konsole gehen", "Go to Console")}
            </Button>
          </Box>

          {/* Features Section */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt={40}>
            {features.map((feature, index) => (
              <Card
                key={index}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className={classes.card}
              >
                <ThemeIcon
                  size={60}
                  radius="md"
                  mb="md"
                  variant="light"
                  color="teal"
                >
                  {feature.icon}
                </ThemeIcon>
                <Title
                  order={3}
                  size="h4"
                  mb="sm"
                  c="light-dark(var(--mantine-color-dark-7), var(--mantine-color-gray-2))"
                >
                  {feature.title}
                </Title>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* Call to Action */}
          <Box ta="center" py={80}>
            <Title order={2} mb="md" c="dark.7">
              {getLocalizedText(
                "Bereit, Ihre Produktivität zu steigern?",
                "Ready to Boost Your Productivity?"
              )}
            </Title>
            <Text size="lg" c="dimmed" mb={30}>
              {getLocalizedText(
                "Starten Sie jetzt und erleben Sie die Vorteile des Work Managers.",
                "Start now and experience the benefits of Work Manager."
              )}
            </Text>
            <Button
              component={Link}
              href="/work"
              size="lg"
              className={classes.primaryButton}
              rightSection={<IconArrowRight size={20} />}
            >
              {getLocalizedText("Los geht's", "Get Started")}
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
