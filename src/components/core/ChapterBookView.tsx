import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChapterConfig } from '../../engine/types';
import { resolveChapterGraphStyle } from '../../engine/resolveGraphStyle';

interface ChapterBookViewProps {
  chapter: ChapterConfig;
}

const ChapterBookView: React.FC<ChapterBookViewProps> = ({ chapter }) => {
  const bookView = chapter.bookView;
  const { layout } = useMemo(() => resolveChapterGraphStyle(chapter, 'book'), [chapter]);

  if (!bookView) return null;

  const { width, height, background } = layout;

  return (
    <motion.div
      className="relative block w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: `${width} / ${height}`,
          background,
          borderRadius: layout.borderRadius,
        }}
      >
        <img
          src={bookView.imageSrc}
          alt={bookView.alt ?? `${chapter.title} textbook figure`}
          className="block h-full w-full object-contain object-center"
          draggable={false}
        />
      </div>
    </motion.div>
  );
};

export default ChapterBookView;
