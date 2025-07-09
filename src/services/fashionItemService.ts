import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';
import { demoWardrobeItems, demoCategories, DemoWardrobeItem } from '../data/demoWardrobeItems';

export interface FashionItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  brand_id?: string;
  category_id?: string;
  images: string[];
  tags?: string[];
  is_active: boolean;
  created_at: string;
  // Demo item fields
  category?: string;
  brand?: string;
  image?: any; // For require() images
  is_demo?: boolean;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  item_id: string;
  collection_name: string;
  notes?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface CreateFashionItemData {
  name: string;
  description?: string;
  brand_id?: string;
  category_id?: string;
  price?: number;
  currency?: string;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  images: string[];
  tags?: string[];
  style_attributes?: Record<string, any>;
  product_code?: string;
  is_featured?: boolean;
}

class FashionItemService {
  
  /**
   * Get available fashion items (includes demo items + database items)
   */
  async getFashionItems(limit: number = 20, category?: string): Promise<FashionItem[]> {
    try {
      console.log('🔍 Fetching fashion items...');
      
      // Always include demo items for immediate UI response
      let allItems: FashionItem[] = [...demoWardrobeItems];
      console.log('✅ Loaded demo items:', demoWardrobeItems.length);
      console.log('Demo items details:', demoWardrobeItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        image: item.image,
        is_demo: item.is_demo
      })));

      // Try to fetch from database as well (but don't block on it)
      try {
        let query = supabase
          .from('fashion_items')
          .select('*')
          .eq('is_active', true)
          .limit(limit);

        if (category) {
          query = query.eq('category_id', category);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          console.log('✅ Also fetched database items:', data.length);
          // Add database items to the list, avoiding duplicates
          const dbItems = data.filter(dbItem => 
            !allItems.some(demoItem => demoItem.name === dbItem.name)
          );
          allItems = [...allItems, ...dbItems];
        } else if (error) {
          console.log('ℹ️ Database fetch failed, using demo items only:', error.message);
        }
      } catch (dbError) {
        console.log('ℹ️ Database unavailable, using demo items only:', dbError);
      }

      console.log('📦 Total items available:', allItems.length);
      return allItems;
    } catch (error) {
      console.error('❌ Failed to get fashion items:', error);
      // Fallback to demo items only
      return demoWardrobeItems;
    }
  }

  /**
   * Get user's favorite items
   */
  async getUserFavorites(collection: string = 'default'): Promise<FashionItem[]> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          fashion_items (*)
        `)
        .eq('user_id', user.id)
        .eq('collection_name', collection);

      if (error) {
        throw new Error(error.message);
      }

      return data?.map(fav => fav.fashion_items).filter(Boolean) || [];
    } catch (error) {
      console.error('Failed to get user favorites:', error);
      return [];
    }
  }

  /**
   * Add item to favorites
   */
  async addToFavorites(itemId: string, collection: string = 'default', notes?: string): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          item_id: itemId,
          collection_name: collection,
          notes: notes
        });

      if (error) {
        // If it's a duplicate error, that's okay
        if (error.code === '23505') {
          console.log('Item already in favorites');
          return true;
        }
        throw new Error(error.message);
      }

      console.log('Added item to favorites:', itemId);
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  }

  /**
   * Remove item from favorites
   */
  async removeFromFavorites(itemId: string, collection: string = 'default'): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('collection_name', collection);

      if (error) {
        throw new Error(error.message);
      }

      console.log('Removed item from favorites:', itemId);
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }

  /**
   * Check if item is in favorites
   */
  async isItemFavorited(itemId: string, collection: string = 'default'): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('collection_name', collection)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(error.message);
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check if item is favorited:', error);
      return false;
    }
  }

  /**
   * Get selected items for try-on (from wardrobe collection)
   */
  async getSelectedItemsForTryOn(): Promise<FashionItem[]> {
    return this.getUserFavorites('wardrobe');
  }

  /**
   * Add item to wardrobe for try-on (with demo item sync to database)
   */
  async addToWardrobe(itemId: string, notes?: string): Promise<boolean> {
    console.log('Adding item to wardrobe:', itemId);
    
    // Check if this is a demo item
    const demoItem = demoWardrobeItems.find(item => item.id === itemId);
    
    if (demoItem) {
      console.log('🎯 Demo item selected for wardrobe:', demoItem.name);
      
      // Try to sync demo item to database in background
      try {
        await this.syncDemoItemToDatabase(demoItem);
      } catch (error) {
        console.log('ℹ️ Demo item sync to database failed, but item is still available for try-on');
      }
      
      // For demo items, we can't use database favorites, so we'll store locally
      // This could be enhanced to use AsyncStorage for persistence
      return true;
    }
    
    // Regular database item
    return this.addToFavorites(itemId, 'wardrobe', notes);
  }

  /**
   * Sync demo item to database for future use
   */
  private async syncDemoItemToDatabase(demoItem: DemoWardrobeItem): Promise<boolean> {
    try {
      console.log('🔄 Syncing demo item to database:', demoItem.name);
      
      // First, ensure categories and brands exist
      const categories = await this.getCategories();
      const brands = await this.getBrands();
      
      let categoryId = categories.find(cat => cat.name === demoItem.category)?.id;
      let brandId = brands.find(brand => brand.name === demoItem.brand)?.id;
      
      // Create category if it doesn't exist
      if (!categoryId) {
        console.log('Creating category:', demoItem.category);
        // This would need the create category method
      }
      
      // Create brand if it doesn't exist  
      if (!brandId) {
        console.log('Creating brand:', demoItem.brand);
        // This would need the create brand method
      }
      
      // Create the fashion item in database
      const itemData = {
        name: demoItem.name,
        description: demoItem.description,
        brand_id: brandId,
        category_id: categoryId,
        price: demoItem.price,
        currency: demoItem.currency,
        colors: demoItem.colors,
        sizes: demoItem.sizes,
        materials: demoItem.materials,
        images: demoItem.images, // Use demo item images
        tags: demoItem.tags,
        style_attributes: demoItem.style_attributes,
        product_code: demoItem.product_code,
        is_featured: demoItem.is_featured
      };
      
      const created = await this.createFashionItem(itemData);
      
      if (created) {
        console.log('✅ Demo item synced to database:', created.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('❌ Failed to sync demo item to database:', error);
      return false;
    }
  }

  /**
   * Remove item from wardrobe
   */
  async removeFromWardrobe(itemId: string): Promise<boolean> {
    console.log('Removing item from wardrobe:', itemId);
    return this.removeFromFavorites(itemId, 'wardrobe');
  }

  /**
   * Get available categories (includes demo categories + database categories)
   */
  async getCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Fetching categories...');
      
      // Always include demo categories for immediate UI response
      let allCategories: Category[] = demoCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        parent_id: undefined,
        icon_name: cat.icon_name,
        sort_order: ['tops', 'bottoms', 'outerwear', 'dresses', 'footwear', 'accessories'].indexOf(cat.name) + 1,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      console.log('✅ Loaded demo categories:', allCategories.length);

      // Try to fetch from database as well
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (!error && data && data.length > 0) {
          console.log('✅ Also fetched database categories:', data.length);
          // Add database categories, avoiding duplicates
          const dbCategories = data.filter(dbCat => 
            !allCategories.some(demoCat => demoCat.name === dbCat.name)
          );
          allCategories = [...allCategories, ...dbCategories];
        }
      } catch (dbError) {
        console.log('ℹ️ Database categories unavailable, using demo categories only');
      }

      return allCategories;
    } catch (error) {
      console.error('Failed to get categories:', error);
      // Fallback to demo categories
      return demoCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        parent_id: undefined,
        icon_name: cat.icon_name,
        sort_order: ['tops', 'bottoms', 'outerwear', 'dresses', 'footwear', 'accessories'].indexOf(cat.name) + 1,
        is_active: true,
        created_at: new Date().toISOString()
      }));
    }
  }

  /**
   * Get available brands
   */
  async getBrands(): Promise<Brand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get brands:', error);
      return [];
    }
  }

  /**
   * Create a new fashion item
   */
  async createFashionItem(itemData: CreateFashionItemData): Promise<FashionItem | null> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('fashion_items')
        .insert({
          name: itemData.name,
          description: itemData.description,
          brand_id: itemData.brand_id,
          category_id: itemData.category_id,
          price: itemData.price,
          currency: itemData.currency || 'USD',
          colors: itemData.colors || [],
          sizes: itemData.sizes || [],
          materials: itemData.materials || [],
          images: itemData.images,
          tags: itemData.tags || [],
          style_attributes: itemData.style_attributes || {},
          product_code: itemData.product_code,
          is_featured: itemData.is_featured || false,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Created new fashion item:', data?.id);
      return data;
    } catch (error) {
      console.error('Failed to create fashion item:', error);
      return null;
    }
  }

  /**
   * Get fashion items by category
   */
  async getFashionItemsByCategory(categoryName: string, limit: number = 20): Promise<FashionItem[]> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .select(`
          *,
          categories!inner (
            name
          )
        `)
        .eq('is_active', true)
        .eq('categories.name', categoryName)
        .eq('categories.is_active', true)
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get fashion items by category:', error);
      return [];
    }
  }

  /**
   * Get a single fashion item by ID
   */
  async getFashionItemById(itemId: string): Promise<FashionItem | null> {
    try {
      const { data, error } = await supabase
        .from('fashion_items')
        .select(`
          *,
          categories (
            name, icon_name
          ),
          brands (
            name, logo_url
          )
        `)
        .eq('id', itemId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to get fashion item by ID:', error);
      return null;
    }
  }
}

export const fashionItemService = new FashionItemService();
export default fashionItemService;