import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calculator,
  Calendar,
  DollarSign,
  Clock,
  Scale,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LegalCalculatorScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [activeCalculator, setActiveCalculator] = useState('deadlines');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);

  const calculators = [
    {
      id: 'deadlines',
      title: 'Calculadora de Plazos',
      description: 'Calcula plazos procesales automáticamente',
      icon: Calendar,
      color: colors.primary,
    },
    {
      id: 'alimony',
      title: 'Calculadora de Alimentos',
      description: 'Estima montos de pensión alimenticia',
      icon: DollarSign,
      color: colors.success,
    },
    {
      id: 'costs',
      title: 'Calculadora de Costos',
      description: 'Calcula aranceles y costos judiciales',
      icon: Calculator,
      color: colors.warning,
    },
    {
      id: 'interest',
      title: 'Calculadora de Intereses',
      description: 'Calcula intereses legales y moratorios',
      icon: Clock,
      color: colors.info,
    },
  ];

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const calculateDeadlines = () => {
    const startDate = new Date(inputs.startDate);
    const caseType = inputs.caseType;
    
    if (!startDate || !caseType) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const deadlineRules: Record<string, { days: number; description: string }> = {
      'contestacion': { days: 3, description: 'Plazo para contestar demanda' },
      'apelacion': { days: 3, description: 'Plazo para apelar' },
      'casacion': { days: 15, description: 'Plazo para casación' },
      'amparo': { days: 3, description: 'Plazo para amparo' },
      'revision': { days: 8, description: 'Plazo para revisión' },
    };

    const rule = deadlineRules[caseType] || { days: 5, description: 'Plazo general' };
    
    // Calculate business days
    const deadline = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < rule.days) {
      deadline.setDate(deadline.getDate() + 1);
      // Skip weekends
      if (deadline.getDay() !== 0 && deadline.getDay() !== 6) {
        daysAdded++;
      }
    }

    setResults({
      deadline: deadline.toLocaleDateString('es-ES'),
      daysLeft: Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      description: rule.description,
      businessDays: rule.days,
    });
  };

  const calculateAlimony = () => {
    const income = parseFloat(inputs.income) || 0;
    const children = parseInt(inputs.children) || 1;
    const otherObligations = parseFloat(inputs.otherObligations) || 0;
    
    if (income <= 0) {
      Alert.alert('Error', 'Por favor ingrese un ingreso válido');
      return;
    }

    // Basic calculation based on El Salvador family law
    const basePercentage = children === 1 ? 0.25 : children === 2 ? 0.35 : 0.45;
    const availableIncome = income - otherObligations;
    const suggestedAmount = availableIncome * basePercentage;
    const minimumAmount = 92; // Minimum wage percentage
    
    setResults({
      suggestedAmount: suggestedAmount.toFixed(2),
      minimumAmount: minimumAmount.toFixed(2),
      percentage: (basePercentage * 100).toFixed(0),
      availableIncome: availableIncome.toFixed(2),
    });
  };

  const calculateCosts = () => {
    const caseType = inputs.costCaseType;
    const amount = parseFloat(inputs.amount) || 0;
    
    if (!caseType) {
      Alert.alert('Error', 'Por favor seleccione el tipo de caso');
      return;
    }

    // Basic court fees calculation
    const fees: Record<string, { base: number; percentage: number; description: string }> = {
      'civil': { base: 50, percentage: 0.02, description: 'Proceso civil' },
      'family': { base: 25, percentage: 0.01, description: 'Proceso de familia' },
      'labor': { base: 30, percentage: 0.015, description: 'Proceso laboral' },
      'commercial': { base: 75, percentage: 0.025, description: 'Proceso mercantil' },
    };

    const fee = fees[caseType] || fees.civil;
    const calculatedFee = fee.base + (amount * fee.percentage);
    const totalCosts = calculatedFee + 20; // Additional administrative costs
    
    setResults({
      courtFee: calculatedFee.toFixed(2),
      administrativeCosts: '20.00',
      totalCosts: totalCosts.toFixed(2),
      description: fee.description,
    });
  };

  const calculateInterest = () => {
    const principal = parseFloat(inputs.principal) || 0;
    const startDate = new Date(inputs.interestStartDate);
    const endDate = new Date(inputs.interestEndDate || new Date());
    const interestType = inputs.interestType;
    
    if (principal <= 0 || !startDate) {
      Alert.alert('Error', 'Por favor complete los campos requeridos');
      return;
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Interest rates based on El Salvador law
    const rates: Record<string, number> = {
      'legal': 0.06, // 6% annual
      'moratory': 0.12, // 12% annual
      'commercial': 0.08, // 8% annual
    };

    const rate = rates[interestType] || rates.legal;
    const interest = principal * rate * (daysDiff / 365);
    const total = principal + interest;
    
    setResults({
      principal: principal.toFixed(2),
      interest: interest.toFixed(2),
      total: total.toFixed(2),
      days: daysDiff,
      rate: (rate * 100).toFixed(0),
    });
  };

  const handleCalculate = () => {
    switch (activeCalculator) {
      case 'deadlines':
        calculateDeadlines();
        break;
      case 'alimony':
        calculateAlimony();
        break;
      case 'costs':
        calculateCosts();
        break;
      case 'interest':
        calculateInterest();
        break;
    }
  };

  const renderDeadlineCalculator = () => (
    <View style={styles.calculatorContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Fecha de inicio</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={inputs.startDate || ''}
          onChangeText={(value) => handleInputChange('startDate', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Tipo de proceso</Text>
        <View style={styles.optionsContainer}>
          {['contestacion', 'apelacion', 'casacion', 'amparo', 'revision'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                inputs.caseType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('caseType', type)}
            >
              <Text style={[
                styles.optionText,
                { color: inputs.caseType === type ? '#ffffff' : colors.text }
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {results && (
        <View style={[styles.resultsCard, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <View style={styles.resultHeader}>
            <CheckCircle size={24} color={colors.success} />
            <Text style={[styles.resultTitle, { color: colors.success }]}>Resultado</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Fecha límite:</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{results.deadline}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Días restantes:</Text>
            <Text style={[styles.resultValue, { color: results.daysLeft > 0 ? colors.success : colors.error }]}>
              {results.daysLeft > 0 ? `${results.daysLeft} días` : 'Vencido'}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Días hábiles:</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{results.businessDays}</Text>
          </View>
          
          <Text style={[styles.resultDescription, { color: colors.textSecondary }]}>
            {results.description}
          </Text>
        </View>
      )}
    </View>
  );

  const renderAlimonyCalculator = () => (
    <View style={styles.calculatorContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Ingresos mensuales ($)</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={inputs.income || ''}
          onChangeText={(value) => handleInputChange('income', value)}
          placeholder="1000.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Número de hijos</Text>
        <View style={styles.optionsContainer}>
          {['1', '2', '3', '4+'].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                inputs.children === num && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('children', num)}
            >
              <Text style={[
                styles.optionText,
                { color: inputs.children === num ? '#ffffff' : colors.text }
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Otras obligaciones ($)</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={inputs.otherObligations || ''}
          onChangeText={(value) => handleInputChange('otherObligations', value)}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      {results && (
        <View style={[styles.resultsCard, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <View style={styles.resultHeader}>
            <DollarSign size={24} color={colors.success} />
            <Text style={[styles.resultTitle, { color: colors.success }]}>Estimación</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Monto sugerido:</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>${results.suggestedAmount}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Monto mínimo:</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>${results.minimumAmount}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Porcentaje:</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{results.percentage}%</Text>
          </View>
          
          <View style={[styles.infoBox, { backgroundColor: colors.info + '20', borderColor: colors.info }]}>
            <Info size={16} color={colors.info} />
            <Text style={[styles.infoText, { color: colors.info }]}>
              Esta es una estimación. El monto final lo determina el juez.
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderCalculatorContent = () => {
    switch (activeCalculator) {
      case 'deadlines':
        return renderDeadlineCalculator();
      case 'alimony':
        return renderAlimonyCalculator();
      default:
        return (
          <View style={styles.comingSoon}>
            <Calculator size={48} color={colors.textSecondary} />
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Calculadora en desarrollo
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calculadoras Legales</Text>
      </View>

      {/* Calculator Selector */}
      <View style={[styles.selectorContainer, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {calculators.map((calc) => {
            const IconComponent = calc.icon;
            return (
              <TouchableOpacity
                key={calc.id}
                style={[
                  styles.calculatorCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  activeCalculator === calc.id && { borderColor: calc.color, backgroundColor: calc.color + '10' }
                ]}
                onPress={() => {
                  setActiveCalculator(calc.id);
                  setResults(null);
                  setInputs({});
                }}
              >
                <IconComponent size={24} color={calc.color} />
                <Text style={[styles.calculatorTitle, { color: colors.text }]}>{calc.title}</Text>
                <Text style={[styles.calculatorDescription, { color: colors.textSecondary }]}>
                  {calc.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Calculator Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCalculatorContent()}
      </ScrollView>

      {/* Calculate Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: colors.primary }]}
          onPress={handleCalculate}
        >
          <Calculator size={20} color="#ffffff" />
          <Text style={styles.calculateButtonText}>Calcular</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  selectorContainer: {
    paddingVertical: 16,
  },
  selectorScroll: {
    paddingHorizontal: 20,
  },
  calculatorCard: {
    width: 160,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  calculatorTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  calculatorDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  calculatorContent: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  resultsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resultValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  resultDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});