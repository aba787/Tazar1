'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Calendar,
  Verified,
  Eye,
} from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  type MachineListing,
  type MachineStatus,
  type MachineCategory,
  MACHINE_STATUS_LABELS,
  MACHINE_CATEGORY_LABELS,
} from '@/types';

// Status badge styles - Neutral
const getStatusStyles = (status: MachineStatus): string => {
  const styles: Record<MachineStatus, string> = {
    AVAILABLE: 'status-available',
    RENTED: 'status-rented',
    MAINTENANCE: 'status-maintenance',
  };
  return styles[status];
};

// Category gradient backgrounds - Neutral grayscale
const getCategoryGradient = (category: MachineCategory): string => {
  const gradients: Record<MachineCategory, string> = {
    CNC: 'from-neutral-600 via-neutral-500 to-neutral-700',
    PRESS: 'from-stone-600 via-stone-500 to-stone-700',
    WELDING: 'from-zinc-600 via-zinc-500 to-zinc-700',
    CUTTING: 'from-slate-600 via-slate-500 to-slate-700',
    OTHER: 'from-gray-600 via-gray-500 to-gray-700',
  };
  return gradients[category];
};

// Category icons for placeholder - Simple geometric
const getCategoryIcon = (category: MachineCategory): string => {
  const icons: Record<MachineCategory, string> = {
    CNC: '⚙',
    PRESS: '◉',
    WELDING: '◈',
    CUTTING: '◇',
    OTHER: '▣',
  };
  return icons[category];
};

interface MachineCardProps {
  machine: MachineListing;
  onClick?: () => void;
  className?: string;
}

export function MachineCard({ machine, onClick, className }: MachineCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Format price in SAR (assuming prices are in halala)
  const formatPrice = (amount?: number): string => {
    if (!amount) return '-';
    return (amount / 100).toLocaleString('ar-SA');
  };

  // Get primary price (prefer hourly, then daily, then weekly)
  const getPrimaryPrice = (): { amount: number; period: string } | null => {
    if (machine.pricing.hourly) {
      return { amount: machine.pricing.hourly, period: 'ساعة' };
    }
    if (machine.pricing.daily) {
      return { amount: machine.pricing.daily, period: 'يوم' };
    }
    if (machine.pricing.weekly) {
      return { amount: machine.pricing.weekly, period: 'أسبوع' };
    }
    return null;
  };

  const primaryPrice = getPrimaryPrice();

  // Format availability date
  const formatAvailableDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();

    if (date <= now) {
      return 'متاح الآن';
    }

    return date.toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        variant="liquid"
        className={cn(
          'cursor-pointer overflow-hidden h-full',
          className
        )}
        onClick={onClick}
      >
        {/* Image Area */}
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          {machine.imageUrl ? (
            <img
              src={machine.imageUrl}
              alt={machine.name}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
            />
          ) : (
            // Gradient placeholder based on category
            <div
              className={cn(
                'w-full h-full bg-gradient-to-br flex items-center justify-center',
                getCategoryGradient(machine.category)
              )}
            >
              <div className="text-center">
                <span className="text-5xl text-white/60">{getCategoryIcon(machine.category)}</span>
                <p className="mt-2 text-white/50 text-sm font-medium">
                  {MACHINE_CATEGORY_LABELS[machine.category]}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <Badge className={cn('text-xs font-medium', getStatusStyles(machine.status))}>
              {MACHINE_STATUS_LABELS[machine.status]}
            </Badge>
          </div>

          {/* Category Tag - Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className="bg-foreground/60 text-background border-0 backdrop-blur-sm text-xs"
            >
              {MACHINE_CATEGORY_LABELS[machine.category]}
            </Badge>
          </div>

          {/* Hover Overlay with "View Details" */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent flex items-end justify-center pb-6"
          >
            <div className="flex items-center gap-2 text-background font-medium text-sm">
              <Eye className="h-4 w-4" />
              <span>عرض التفاصيل</span>
            </div>
          </motion.div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Header: Name + Description */}
          <div>
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {machine.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {machine.description}
            </p>
          </div>

          {/* Meta Row: Location + Rating */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{machine.location.city}</span>
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-foreground/20 text-foreground" />
              <span className="font-medium font-numbers">{machine.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">
                ({machine.reviewCount})
              </span>
            </span>
          </div>

          {/* Pricing Section */}
          <div className="pt-3 border-t border-border/50">
            {primaryPrice && (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground font-numbers">
                  {formatPrice(primaryPrice.amount)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {machine.pricing.currency}/{primaryPrice.period}
                </span>
              </div>
            )}

            {/* Secondary rates */}
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
              {machine.pricing.daily && primaryPrice?.period !== 'يوم' && (
                <span className="font-numbers">
                  {formatPrice(machine.pricing.daily)} {machine.pricing.currency}/يوم
                </span>
              )}
              {machine.pricing.weekly && primaryPrice?.period !== 'أسبوع' && (
                <span className="font-numbers">
                  {formatPrice(machine.pricing.weekly)} {machine.pricing.currency}/أسبوع
                </span>
              )}
            </div>
          </div>

          {/* Footer: Provider Name + Availability */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{machine.owner.name}</span>
              {machine.owner.verified && (
                <Verified className="h-3.5 w-3.5 text-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatAvailableDate(machine.availableFrom)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MachineCard;
