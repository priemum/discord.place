'use client';

import { useEffect } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import cn from '@/lib/cn';
import Square from '@/app/components/Background/Square';
import AnimatedCount from '@/app/components/AnimatedCount';
import useSearchStore from '@/stores/emojis/search';
import { motion } from 'framer-motion';
import Emojis from '@/app/(emojis)/emojis/components/Hero/Emojis';
import SearchInput from '@/app/components/SearchInput';
import { useShallow } from 'zustand/react/shallow';
import Select from '@/app/components/Select';
import config from '@/config';

const BricolageGrotesque = Bricolage_Grotesque({ subsets: ['latin'] });

export default function Hero() {
  const { fetchEmojis, total, category, setCategory, sort, setSort, loading, search, setPage } = useSearchStore(useShallow(state => ({
    fetchEmojis: state.fetchEmojis,
    total: state.total,
    category: state.category,
    setCategory: state.setCategory,
    sort: state.sort,
    setSort: state.setSort,
    loading: state.loading,
    search: state.search,
    setPage: state.setPage
  })));

  useEffect(() => {
    fetchEmojis('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sequenceTransition = {
    duration: 0.25,
    type: 'spring',
    stiffness: 260,
    damping: 20
  };

  return (
    <div className="z-0 relative flex flex-col pt-[14rem] items-center px-4 sm:px-0">
      <Square column='10' row='10' transparentEffectDirection='bottomToTop' blockColor='rgba(var(--bg-secondary))' />

      <div className='absolute top-[-15%] max-w-[800px] w-full h-[300px] rounded-[5rem] bg-[#ffffff10] blur-[15rem]' />

      <div className='max-w-[700px] flex flex-col w-full'>
        <motion.h1 
          className={cn(
            'text-5xl font-medium max-w-[700px] text-center text-primary',
            BricolageGrotesque.className
          )}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sequenceTransition, delay: 0.1 }}
        >
          Discover the emojis
        </motion.h1>
        <motion.span className="sm:text-lg max-w-[700px] text-center mt-8 text-neutral-400" initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sequenceTransition, delay: 0.2 }}>
          Explore, find and download the perfect emoji for your Discord server!<br/>You have <span className='inline-flex'><AnimatedCount data={total} /></span> emojis to explore. 
        </motion.span>

        <div className='flex flex-col items-center justify-center w-full gap-2 mt-8 sm:flex-row'>
          <SearchInput
            placeholder='Search for a emoji by name...'
            loading={loading}
            search={search}
            fetchData={fetchEmojis}
            setPage={setPage}
            animationDelay={0.3}
          />

          <motion.div
            className='flex flex-col items-center w-full gap-2 mobile:flex-row sm:w-max'
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...sequenceTransition, delay: 0.3 }}
          >
            <Select
              placeholder='Category'
              options={
                config.emojiCategories.map(category => ({
                  label: <div className='flex items-center gap-x-2'>
                    <span className='text-tertiary'>
                      {config.emojiCategoriesIcons[category]}
                    </span>

                    {category}
                  </div>,
                  value: category
                }))
              }
              value={category}
              onChange={setCategory}
              disabled={loading}
            />

            <Select
              placeholder='Sorting'
              options={[
                ...[
                  {
                    label: 'Popular',
                    value: 'Popular'
                  },
                  {
                    label: 'Newest',
                    value: 'Newest'
                  },
                  {
                    label: 'Oldest',
                    value: 'Oldest'
                  }
                ].map(option => ({
                  label: <div className='flex items-center gap-x-2'>
                    {config.sortIcons[option.value.replace(' ', '')]}
                    {option.label}
                  </div>,
                  value: option.value
                }))
              ]}
              value={sort}
              onChange={setSort}
              disabled={loading}
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        className='max-w-[1000px] my-16 w-full flex flex-col gap-y-8 lg:px-0 px-2 sm:px-4'
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...sequenceTransition, delay: 0.6 }}
      >
        <Emojis />
      </motion.div>
    </div>
  );
}