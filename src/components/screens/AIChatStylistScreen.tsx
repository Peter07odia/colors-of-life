import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Bot, User } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const STYLIST_NAME = "Emma";
const STYLIST_IMAGE_URL = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80";

export default function AIChatStylistScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hi there! I'm ${STYLIST_NAME}, your personal AI Fashion Stylist! 👗✨ I'm here to help you with outfit ideas, color combinations, style advice, and fashion recommendations. What can I help you with today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.text);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('outfit') || input.includes('what to wear')) {
      return "Great question! For a stylish outfit, I'd suggest considering the occasion first. For casual days, try high-waisted jeans with a cropped blazer and white sneakers. For formal events, a midi dress with heels works perfectly. What's the occasion you're dressing for? 👔👗";
    }
    
    if (input.includes('color') || input.includes('colours')) {
      return "Colors can make or break an outfit! Here are some winning combinations:\n\n• Navy & White (classic and timeless)\n• Black & Gold (elegant and bold)\n• Blush Pink & Grey (soft and modern)\n• Emerald Green & Cream (sophisticated)\n\nWhat's your favorite color to work with? 🎨";
    }
    
    if (input.includes('summer') || input.includes('hot')) {
      return "Summer styling is all about staying cool and looking chic! ☀️\n\n• Lightweight fabrics like linen and cotton\n• Bright colors and pastels\n• Flowy dresses and breathable tops\n• Comfortable sandals or canvas sneakers\n• Don't forget a stylish hat for sun protection!\n\nAny specific summer events you're preparing for?";
    }
    
    if (input.includes('winter') || input.includes('cold')) {
      return "Winter fashion can be both warm and stylish! ❄️\n\n• Layer with style: turtleneck + cardigan + coat\n• Invest in quality boots and warm accessories\n• Rich colors like burgundy, navy, and forest green\n• Cozy textures like wool, cashmere, and faux fur\n• Statement coats can elevate any outfit\n\nWhat's your biggest winter styling challenge?";
    }
    
    if (input.includes('work') || input.includes('office') || input.includes('professional')) {
      return "Professional styling doesn't have to be boring! 💼\n\n• Tailored blazers in neutral colors\n• Well-fitted trousers or pencil skirts\n• Classic button-down shirts\n• Closed-toe shoes with modest heels\n• Minimal, elegant accessories\n\nRemember, confidence is your best accessory! What type of work environment are you dressing for?";
    }
    
    if (input.includes('date') || input.includes('romantic')) {
      return "Date night calls for something special! 💕\n\n• Choose something that makes YOU feel confident\n• A little black dress is always a winner\n• Add one statement piece (bold lipstick, earrings, or shoes)\n• Comfort is key - you want to enjoy yourself!\n• Consider the venue when choosing your outfit\n\nWhat kind of date are you planning?";
    }
    
    if (input.includes('thank') || input.includes('thanks')) {
      return `You're so welcome! I'm here whenever you need styling advice. Fashion should be fun and make you feel amazing! 💖 - ${STYLIST_NAME}`;
    }
    
    if (input.includes('hello') || input.includes('hi')) {
      return `Hello again! Great to see you back! What fashion challenge can I help you with today? 😊 - ${STYLIST_NAME}`;
    }
    
    // Default response
    return "That's a great style question! Fashion is all about expressing your personality and feeling confident. I'd love to give you more specific advice - could you tell me more about your style preferences, the occasion, or what you're looking to achieve with your outfit? 💫";
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={styles.messageHeader}>
        {item.isUser ? (
          <User size={16} color={colors.text.secondary} />
        ) : (
          <Image 
            source={{ uri: STYLIST_IMAGE_URL }}
            style={styles.stylistImage}
          />
        )}
        <Text style={styles.messageSender}>
          {item.isUser ? 'You' : STYLIST_NAME}
        </Text>
      </View>
      <Text style={[styles.messageText, item.isUser ? styles.userMessageText : styles.aiMessageText]}>
        {item.text}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={styles.messageHeader}>
          <Image 
            source={{ uri: STYLIST_IMAGE_URL }}
            style={styles.stylistImage}
          />
          <Text style={styles.messageSender}>{STYLIST_NAME}</Text>
        </View>
        <Text style={[styles.messageText, styles.aiMessageText, styles.typingText]}>
          Thinking about your style... ✨
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListFooterComponent={renderTypingIndicator}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about fashion, styling tips, outfit ideas..."
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color={!inputText.trim() ? colors.text.secondary : 'white'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 16,
  },
  userMessageText: {
    backgroundColor: '#7928CA',
    color: 'white',
  },
  aiMessageText: {
    backgroundColor: colors.background.off,
    color: colors.text.primary,
  },
  typingText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: colors.background.off,
    backgroundColor: colors.background.main,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.background.off,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.off,
  },
  sendButton: {
    backgroundColor: '#7928CA',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.off,
  },
  stylistImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7928CA',
  },
}); 