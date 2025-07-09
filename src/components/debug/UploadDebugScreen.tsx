import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react-native';

import { Button } from '../ui/Button';
import { Heading, AppText } from '../ui/Typography';
import { colors } from '../../constants/colors';
import { UploadTest } from '../../lib/utils/uploadTest';

interface UploadDebugScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

export function UploadDebugScreen({ visible, onClose }: UploadDebugScreenProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      {
        name: 'User Authentication',
        test: () => UploadTest.getUserInfo()
      },
      {
        name: 'Storage Bucket Access',
        test: () => UploadTest.checkBuckets()
      },
      {
        name: 'Upload Functionality',
        test: () => UploadTest.testUpload()
      }
    ];

    const testResults: TestResult[] = [];

    for (const test of tests) {
      try {
        const result = await test.test();
        testResults.push({
          name: test.name,
          success: result.success,
          message: result.message,
          details: result.details
        });
      } catch (error) {
        testResults.push({
          name: test.name,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        });
      }
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const renderTestResult = (result: TestResult, index: number) => (
    <View key={index} style={styles.testResult}>
      <View style={styles.testHeader}>
        {result.success ? (
          <CheckCircle size={20} color={colors.success} />
        ) : (
          <AlertCircle size={20} color={colors.error} />
        )}
        <Text style={styles.testName}>{result.name}</Text>
      </View>
      <Text style={[
        styles.testMessage,
        { color: result.success ? colors.success : colors.error }
      ]}>
        {result.message}
      </Text>
      {result.details && (
        <Text style={styles.testDetails}>
          {JSON.stringify(result.details, null, 2)}
        </Text>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Heading style={styles.title}>Upload Debug</Heading>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Upload Functionality</Text>
          <Text style={styles.sectionDescription}>
            This will test authentication, storage bucket access, and upload functionality.
          </Text>
          
          <Button
            title={isRunning ? "Running Tests..." : "Run Tests"}
            onPress={runTests}
            disabled={isRunning}
            style={styles.testButton}
          />

          {isRunning && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Running upload tests...</Text>
            </View>
          )}
        </View>

        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {results.map(renderTestResult)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Issues & Solutions</Text>
          
          <View style={styles.troubleshootItem}>
            <Text style={styles.troubleshootTitle}>Storage bucket not found</Text>
            <Text style={styles.troubleshootDescription}>
              Run the fix-storage-upload.sql script in your Supabase SQL Editor
            </Text>
          </View>

          <View style={styles.troubleshootItem}>
            <Text style={styles.troubleshootTitle}>Permission denied</Text>
            <Text style={styles.troubleshootDescription}>
              Check that Row Level Security policies are correctly configured
            </Text>
          </View>

          <View style={styles.troubleshootItem}>
            <Text style={styles.troubleshootTitle}>User not authenticated</Text>
            <Text style={styles.troubleshootDescription}>
              Make sure you're signed in to the app before testing uploads
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.off,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  testButton: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  testResult: {
    backgroundColor: colors.background.off,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 8,
  },
  testMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  testDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: colors.background.main,
    padding: 8,
    borderRadius: 6,
  },
  troubleshootItem: {
    marginBottom: 16,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  troubleshootDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
}); 