export type RootTabParamList = {
  Discover: undefined;
  TryOn: undefined;
  Search: undefined; // Now AI Chat Stylist
  Wardrobe: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  ProductDetail: { productId: string };
  TryOnResult: { imageUri: string; productId: string };
  SearchScreen: undefined;
}; 