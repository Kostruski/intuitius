'use client';
import { Box, Flex, Card, Text, Heading, Button } from '@radix-ui/themes';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MainPage = () => {
  return (
    <Box className="pb-4 md:pb-8 h-dvh bg-background">
      <Heading size="6" className="text-center my-8">
        Witaj w chacie Elgum
      </Heading>

      <Flex
        direction={{ initial: 'column', md: 'row' }}
        gap="6"
        justify="center"
        align="stretch"
        className="px-4 md:px-8"
      >
        {/* First Card */}
        <Card className="w-full md:w-96 p-6 flex flex-col">
          <Box className="flex-1">
            <Heading size="4" mb="2">
              Załóż konto
            </Heading>
            <Text as="p" size="2" color="gray">
              Zaloguj się lub załóż konto.
            </Text>
          </Box>
          <Box mt="4">
            <Link href="/login">
              <Button variant="solid" className="w-full">
                Zaloguj się
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </Box>
        </Card>

        {/* Second Card */}
        <Card className="w-full md:w-96 p-6 flex flex-col">
          <Box className="flex-1">
            <Heading size="4" mb="2">
              Przejdź do wersji demo
            </Heading>
            <Text as="p" size="2" color="gray">
              Zadawaj pytania, korzystaj z bazy wiedzy.
            </Text>
          </Box>
          <Box mt="4">
            <Link href="/demo">
              <Button variant="outline" className="w-full">
                Przejdź do demo
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </Box>
        </Card>
      </Flex>
    </Box>
  );
};

export default MainPage;
