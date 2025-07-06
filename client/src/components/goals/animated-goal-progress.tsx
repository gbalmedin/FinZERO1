import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Star, 
  Trophy, 
  Sparkles, 
  Heart,
  Gift,
  PartyPopper,
  Zap,
  Crown,
  Rocket,
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/charts';

interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
}

interface AnimatedGoalProgressProps {
  goals: FinancialGoal[];
  onUpdateGoal?: (goalId: number, amount: number) => void;
}

// Milestone configuration with cute icons and messages
const MILESTONES = [
  { 
    threshold: 10, 
    icon: Zap, 
    color: 'text-blue-500', 
    bg: 'bg-blue-100', 
    message: 'Ótimo começo! 🎯',
    title: 'Primeiro Passo'
  },
  { 
    threshold: 25, 
    icon: Star, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-100', 
    message: 'Você está brilhando! ⭐',
    title: 'Estrela em Ascensão'
  },
  { 
    threshold: 50, 
    icon: Heart, 
    color: 'text-pink-500', 
    bg: 'bg-pink-100', 
    message: 'Na metade do caminho! 💖',
    title: 'Meio Caminho Andado'
  },
  { 
    threshold: 75, 
    icon: Crown, 
    color: 'text-purple-500', 
    bg: 'bg-purple-100', 
    message: 'Quase lá, campeão! 👑',
    title: 'Quase Realeza'
  },
  { 
    threshold: 90, 
    icon: Rocket, 
    color: 'text-green-500', 
    bg: 'bg-green-100', 
    message: 'Falta pouquinho! 🚀',
    title: 'Decolagem Final'
  },
  { 
    threshold: 100, 
    icon: Trophy, 
    color: 'text-amber-500', 
    bg: 'bg-amber-100', 
    message: 'Meta conquistada! 🏆',
    title: 'Objetivo Alcançado'
  }
];

// Celebration animation component
const CelebrationAnimation = ({ milestone, onComplete }: { 
  milestone: typeof MILESTONES[0], 
  onComplete: () => void 
}) => {
  const Icon = milestone.icon;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1], 
        opacity: [0, 1, 1],
        rotate: [0, 10, -10, 0]
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        duration: 0.8,
        ease: "easeOut"
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onComplete}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className={`${milestone.bg} p-8 rounded-2xl shadow-2xl border-2 border-white max-w-sm mx-4`}
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className={`${milestone.color} mx-auto w-16 h-16 flex items-center justify-center`}
          >
            <Icon size={64} />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {milestone.title}
            </h3>
            <p className="text-gray-600 text-lg">
              {milestone.message}
            </p>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <PartyPopper className="w-8 h-8 text-purple-500 mx-auto" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Floating particles effect */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200
          }}
          transition={{ 
            duration: 2,
            delay: i * 0.1,
            ease: "easeOut"
          }}
          className="absolute"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Individual goal progress card
const GoalProgressCard = ({ 
  goal, 
  onCelebration,
  onUpdateGoal 
}: { 
  goal: FinancialGoal,
  onCelebration: (milestone: typeof MILESTONES[0]) => void,
  onUpdateGoal?: (goalId: number, amount: number) => void
}) => {
  const [previousProgress, setPreviousProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isCompleted = progress >= 100;
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  
  // Check for milestone achievements
  useEffect(() => {
    if (progress > previousProgress) {
      const achievedMilestone = MILESTONES.find(m => 
        progress >= m.threshold && previousProgress < m.threshold
      );
      
      if (achievedMilestone) {
        setIsAnimating(true);
        setTimeout(() => {
          onCelebration(achievedMilestone);
          setIsAnimating(false);
        }, 300);
      }
    }
    setPreviousProgress(progress);
  }, [progress, previousProgress, onCelebration]);
  
  // Get current milestone info
  const currentMilestone = MILESTONES.find(m => progress >= m.threshold) || MILESTONES[0];
  const nextMilestone = MILESTONES.find(m => progress < m.threshold);
  
  const getPriorityColor = (priority: string = 'medium') => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getPriorityBadge = (priority: string = 'medium') => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge variant="secondary">Média</Badge>;
      case 'low': return <Badge className="bg-green-100 text-green-800">Baixa</Badge>;
      default: return <Badge variant="secondary">Média</Badge>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${getPriorityColor(goal.priority)} ${isCompleted ? 'ring-2 ring-green-300' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Target className="w-5 h-5 text-gray-600" />
                )}
                {goal.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getPriorityBadge(goal.priority)}
                {goal.category && (
                  <Badge variant="outline">{goal.category}</Badge>
                )}
              </div>
            </div>
            
            <motion.div
              animate={isAnimating ? { 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              } : {}}
              transition={{ duration: 0.6 }}
              className={`${currentMilestone.color}`}
            >
              {React.createElement(currentMilestone.icon, { size: 24 })}
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-3"
              />
              
              {/* Milestone markers */}
              <div className="absolute inset-0 flex items-center">
                {MILESTONES.slice(0, -1).map((milestone, index) => {
                  const position = (milestone.threshold / 100) * 100;
                  const isAchieved = progress >= milestone.threshold;
                  const Icon = milestone.icon;
                  
                  return (
                    <motion.div
                      key={milestone.threshold}
                      style={{ left: `${position}%` }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      whileHover={{ scale: 1.2 }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                        isAchieved ? milestone.bg : 'bg-gray-200'
                      }`}>
                        <Icon 
                          size={12} 
                          className={isAchieved ? milestone.color : 'text-gray-400'} 
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Amount information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Atual</p>
              <p className="font-semibold text-lg">
                {formatCurrency(goal.currentAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Meta</p>
              <p className="font-semibold text-lg">
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
          </div>
          
          {/* Remaining amount */}
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Faltam</span>
              <span className="font-semibold">
                {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
              </span>
            </div>
          </div>
          
          {/* Deadline information */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Prazo</span>
            </div>
            <span className={`font-medium ${
              isOverdue ? 'text-red-600' : 
              daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {isOverdue ? 
                `${Math.abs(daysLeft)} dias atrasado` : 
                daysLeft === 0 ? 'Hoje!' :
                `${daysLeft} dias restantes`
              }
            </span>
          </div>
          
          {/* Next milestone info */}
          {nextMilestone && !isCompleted && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <div className={`${nextMilestone.color}`}>
                  {React.createElement(nextMilestone.icon, { size: 16 })}
                </div>
                <span className="text-blue-700">
                  Próxima conquista em {formatCurrency((nextMilestone.threshold / 100) * goal.targetAmount - goal.currentAmount)}
                </span>
              </div>
            </div>
          )}
          
          {/* Quick actions */}
          {onUpdateGoal && !isCompleted && (
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onUpdateGoal(goal.id, 100)}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                +R$ 100
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onUpdateGoal(goal.id, 500)}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                +R$ 500
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AnimatedGoalProgress({ goals, onUpdateGoal }: AnimatedGoalProgressProps) {
  const [celebratingMilestone, setCelebratingMilestone] = useState<typeof MILESTONES[0] | null>(null);
  
  const handleCelebration = (milestone: typeof MILESTONES[0]) => {
    setCelebratingMilestone(milestone);
  };
  
  const completedGoals = goals.filter(goal => (goal.currentAmount / goal.targetAmount) >= 1);
  const activeGoals = goals.filter(goal => (goal.currentAmount / goal.targetAmount) < 1);
  
  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma meta cadastrada
            </h3>
            <p className="text-gray-500 mb-6">
              Comece definindo suas metas financeiras e acompanhe seu progresso com animações divertidas!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Metas Ativas</p>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conquistadas</p>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-600" />
            Metas em Progresso
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGoals.map(goal => (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                onCelebration={handleCelebration}
                onUpdateGoal={onUpdateGoal}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            Metas Conquistadas
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedGoals.map(goal => (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                onCelebration={handleCelebration}
                onUpdateGoal={onUpdateGoal}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Celebration modal */}
      <AnimatePresence>
        {celebratingMilestone && (
          <CelebrationAnimation
            milestone={celebratingMilestone}
            onComplete={() => setCelebratingMilestone(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}