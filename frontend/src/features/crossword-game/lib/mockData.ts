import type { CrosswordApiResponse } from "@/entities/crossword/types"

/**
 * Мок-данные для тестирования кроссворда
 */
export const mockCrosswordData: CrosswordApiResponse = {
  words: [
    { 
      id: '1', 
      word: 'forest', 
      coordinate: { row: 0, col: 0, direction: 'across' }, 
      definition: 'Large area covered chiefly with trees and undergrowth',
      clueImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
    },
    { 
      id: '2', 
      word: 'island', 
      coordinate: { row: 1, col: 2, direction: 'down' }, 
      definition: 'A piece of land surrounded by water',
      clueImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    { 
      id: '3', 
      word: 'desert', 
      coordinate: { row: 3, col: 0, direction: 'across' }, 
      definition: 'A dry, barren area with little or no vegetation',
      clueImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop'
    },
    { 
      id: '4', 
      word: 'flower', 
      coordinate: { row: 4, col: 3, direction: 'down' }, 
      definition: 'The colorful reproductive part of a plant',
      clueImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop'
    },
    { 
      id: '5', 
      word: 'animal', 
      coordinate: { row: 6, col: 0, direction: 'across' }, 
      definition: 'A living creature that is not a plant',
      clueImage: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop'
    },
    { 
      id: '6', 
      word: 'canopy', 
      coordinate: { row: 0, col: 6, direction: 'down' }, 
      definition: 'Uppermost layer of branches and leaves in a forest',
      clueImage: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop'
    }
  ],
  board_size: { rows: 10, cols: 10 }
}
