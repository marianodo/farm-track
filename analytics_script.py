#!/usr/bin/env python3
"""
Farm Track Analytics Script
===========================

Este script analiza el uso de la aplicación Farm Track conectándose directamente
a la base de datos PostgreSQL para extraer métricas clave sobre el uso de la aplicación.

Métricas analizadas:
- Total de usuarios registrados
- Incremento de usuarios en el último mes
- Total de campos (granjas)
- Total de corrales (pens)
- Total de mediciones tomadas
- Análisis de actividad por período
- Usuarios más activos
- Distribución geográfica de campos

Requisitos:
pip install psycopg2-binary pandas matplotlib seaborn python-dotenv

Uso:
python analytics_script.py
"""

import os
import sys
from datetime import datetime, timedelta
import psycopg2
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from dotenv import load_dotenv
import json

# Cargar variables de entorno
load_dotenv()

class FarmTrackAnalytics:
    def __init__(self):
        """Inicializar conexión a la base de datos"""
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            print("❌ Error: DATABASE_URL no encontrada en las variables de entorno")
            print("Por favor, asegúrate de tener un archivo .env con DATABASE_URL")
            sys.exit(1)
        
        try:
            self.conn = psycopg2.connect(self.db_url)
            self.cursor = self.conn.cursor()
            print("✅ Conexión a la base de datos establecida")
        except Exception as e:
            print(f"❌ Error conectando a la base de datos: {e}")
            sys.exit(1)
    
    def get_basic_stats(self):
        """Obtener estadísticas básicas de la aplicación"""
        print("\n📊 ESTADÍSTICAS BÁSICAS")
        print("=" * 50)
        
        stats = {}
        
        # Total de usuarios
        self.cursor.execute("SELECT COUNT(*) FROM \"User\"")
        total_users = self.cursor.fetchone()[0]
        stats['total_users'] = total_users
        print(f"👥 Total de usuarios registrados: {total_users}")
        
        # Usuarios verificados
        self.cursor.execute("SELECT COUNT(*) FROM \"User\" WHERE is_verified = true")
        verified_users = self.cursor.fetchone()[0]
        stats['verified_users'] = verified_users
        print(f"✅ Usuarios verificados: {verified_users}")
        
        # Usuarios activos (que han creado al menos un campo)
        self.cursor.execute("SELECT COUNT(DISTINCT \"userId\") FROM \"Field\"")
        active_users = self.cursor.fetchone()[0]
        stats['active_users'] = active_users
        print(f"🔥 Usuarios activos: {active_users}")
        
        # Total de campos
        self.cursor.execute("SELECT COUNT(*) FROM \"Field\"")
        total_fields = self.cursor.fetchone()[0]
        stats['total_fields'] = total_fields
        print(f"🏡 Total de campos (granjas): {total_fields}")
        
        # Total de corrales
        self.cursor.execute("SELECT COUNT(*) FROM \"Pen\"")
        total_pens = self.cursor.fetchone()[0]
        stats['total_pens'] = total_pens
        print(f"🐄 Total de corrales: {total_pens}")
        
        # Total de mediciones
        self.cursor.execute("SELECT COUNT(*) FROM \"Measurement\"")
        total_measurements = self.cursor.fetchone()[0]
        stats['total_measurements'] = total_measurements
        print(f"📈 Total de mediciones: {total_measurements}")
        
        # Total de reportes
        self.cursor.execute("SELECT COUNT(*) FROM \"Report\"")
        total_reports = self.cursor.fetchone()[0]
        stats['total_reports'] = total_reports
        print(f"📋 Total de reportes: {total_reports}")
        
        # Total de sujetos (animales)
        self.cursor.execute("SELECT COUNT(*) FROM \"Subject\"")
        total_subjects = self.cursor.fetchone()[0]
        stats['total_subjects'] = total_subjects
        print(f"🐮 Total de animales registrados: {total_subjects}")
        
        return stats
    
    def get_monthly_growth(self):
        """Analizar crecimiento mensual"""
        print("\n📈 CRECIMIENTO MENSUAL")
        print("=" * 50)
        
        # Usuarios registrados en el último mes
        last_month = datetime.now() - timedelta(days=30)
        self.cursor.execute(
            "SELECT COUNT(*) FROM \"User\" WHERE created_at >= %s",
            (last_month,)
        )
        new_users_month = self.cursor.fetchone()[0]
        print(f"👥 Nuevos usuarios (último mes): {new_users_month}")
        
        # Campos creados en el último mes
        self.cursor.execute(
            "SELECT COUNT(*) FROM \"Field\" WHERE created_at >= %s",
            (last_month,)
        )
        new_fields_month = self.cursor.fetchone()[0]
        print(f"🏡 Nuevos campos (último mes): {new_fields_month}")
        
        # Mediciones en el último mes
        self.cursor.execute(
            "SELECT COUNT(*) FROM \"Measurement\" WHERE created_at >= %s",
            (last_month,)
        )
        new_measurements_month = self.cursor.fetchone()[0]
        print(f"📈 Nuevas mediciones (último mes): {new_measurements_month}")
        
        # Reportes en el último mes
        self.cursor.execute(
            "SELECT COUNT(*) FROM \"Report\" WHERE created_at >= %s",
            (last_month,)
        )
        new_reports_month = self.cursor.fetchone()[0]
        print(f"📋 Nuevos reportes (último mes): {new_reports_month}")
        
        return {
            'new_users_month': new_users_month,
            'new_fields_month': new_fields_month,
            'new_measurements_month': new_measurements_month,
            'new_reports_month': new_reports_month
        }
    
    def get_activity_analysis(self):
        """Análisis de actividad por período"""
        print("\n⚡ ANÁLISIS DE ACTIVIDAD")
        print("=" * 50)
        
        # Usuarios más activos (por número de mediciones)
        query = """
        SELECT u.username, u.email, COUNT(m.id) as measurement_count
        FROM "User" u
        LEFT JOIN "Field" f ON u.id = f."userId"
        LEFT JOIN "Report" r ON f.id = r.field_id
        LEFT JOIN "Measurement" m ON r.id = m.report_id
        GROUP BY u.id, u.username, u.email
        HAVING COUNT(m.id) > 0
        ORDER BY measurement_count DESC
        LIMIT 5
        """
        
        self.cursor.execute(query)
        top_users = self.cursor.fetchall()
        
        print("🏆 Top 5 usuarios más activos:")
        for i, (username, email, count) in enumerate(top_users, 1):
            print(f"  {i}. {username} ({email}): {count} mediciones")
        
        # Actividad por días de la semana
        query = """
        SELECT 
            EXTRACT(DOW FROM created_at) as day_of_week,
            COUNT(*) as measurement_count
        FROM "Measurement"
        GROUP BY EXTRACT(DOW FROM created_at)
        ORDER BY day_of_week
        """
        
        self.cursor.execute(query)
        daily_activity = self.cursor.fetchall()
        
        days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        print("\n📅 Actividad por día de la semana:")
        for day_num, count in daily_activity:
            print(f"  {days[int(day_num)]}: {count} mediciones")
        
        return {
            'top_users': top_users,
            'daily_activity': daily_activity
        }
    
    def get_geographic_distribution(self):
        """Distribución geográfica de campos"""
        print("\n🌍 DISTRIBUCIÓN GEOGRÁFICA")
        print("=" * 50)
        
        # Campos con ubicación
        query = """
        SELECT location, COUNT(*) as field_count
        FROM "Field"
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location
        ORDER BY field_count DESC
        LIMIT 10
        """
        
        self.cursor.execute(query)
        locations = self.cursor.fetchall()
        
        print("📍 Top 10 ubicaciones de campos:")
        for location, count in locations:
            print(f"  {location}: {count} campos")
        
        # Campos con coordenadas
        query = """
        SELECT COUNT(*) 
        FROM "Field" 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        """
        
        self.cursor.execute(query)
        fields_with_coords = self.cursor.fetchone()[0]
        print(f"\n🗺️  Campos con coordenadas GPS: {fields_with_coords}")
        
        return {
            'locations': locations,
            'fields_with_coords': fields_with_coords
        }
    
    def get_productivity_metrics(self):
        """Métricas de productividad"""
        print("\n🐄 MÉTRICAS DE PRODUCTIVIDAD")
        print("=" * 50)
        
        # Total de productividad registrada
        query = """
        SELECT 
            COUNT(*) as total_records,
            AVG(total_cows) as avg_total_cows,
            AVG(milking_cows) as avg_milking_cows,
            AVG(average_production) as avg_production,
            AVG(somatic_cells) as avg_somatic_cells
        FROM "Productivity"
        WHERE total_cows IS NOT NULL
        """
        
        self.cursor.execute(query)
        productivity = self.cursor.fetchone()
        
        if productivity[0] > 0:
            total_records, avg_cows, avg_milking, avg_prod, avg_somatic = productivity
            print(f"📊 Registros de productividad: {total_records}")
            print(f"🐄 Promedio de vacas totales: {avg_cows:.1f}")
            print(f"🥛 Promedio de vacas en ordeño: {avg_milking:.1f}")
            print(f"📈 Producción promedio: {avg_prod:.2f} L")
            print(f"🔬 Células somáticas promedio: {avg_somatic:.0f}")
        else:
            print("📊 No hay registros de productividad")
        
        return productivity
    
    def generate_usage_summary(self):
        """Generar resumen de uso"""
        print("\n📋 RESUMEN DE USO")
        print("=" * 50)
        
        basic_stats = self.get_basic_stats()
        monthly_growth = self.get_monthly_growth()
        
        # Calcular métricas de adopción
        if basic_stats['total_users'] > 0:
            adoption_rate = (basic_stats['active_users'] / basic_stats['total_users']) * 100
            print(f"📊 Tasa de adopción: {adoption_rate:.1f}%")
        
        if basic_stats['total_fields'] > 0:
            avg_fields_per_user = basic_stats['total_fields'] / basic_stats['active_users']
            print(f"🏡 Promedio de campos por usuario activo: {avg_fields_per_user:.1f}")
        
        if basic_stats['total_pens'] > 0:
            avg_pens_per_field = basic_stats['total_pens'] / basic_stats['total_fields']
            print(f"🐄 Promedio de corrales por campo: {avg_pens_per_field:.1f}")
        
        if basic_stats['total_measurements'] > 0 and basic_stats['total_reports'] > 0:
            avg_measurements_per_report = basic_stats['total_measurements'] / basic_stats['total_reports']
            print(f"📈 Promedio de mediciones por reporte: {avg_measurements_per_report:.1f}")
        
        # Determinar si la app está siendo usada
        print(f"\n🎯 EVALUACIÓN DE USO:")
        if basic_stats['active_users'] >= 5:
            print("✅ La aplicación está siendo utilizada activamente")
        elif basic_stats['active_users'] >= 2:
            print("⚠️  La aplicación tiene uso moderado")
        else:
            print("❌ La aplicación tiene muy poco uso")
        
        if monthly_growth['new_users_month'] > 0:
            print("📈 Hay crecimiento en nuevos usuarios")
        
        if monthly_growth['new_measurements_month'] > 10:
            print("📊 Hay actividad regular de mediciones")
        
        return {
            'basic_stats': basic_stats,
            'monthly_growth': monthly_growth
        }
    
    def create_visualizations(self):
        """Crear visualizaciones de los datos"""
        print("\n📊 Generando visualizaciones...")
        
        # Configurar estilo
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Farm Track - Análisis de Uso', fontsize=16, fontweight='bold')
        
        # 1. Crecimiento mensual de usuarios
        query = """
        SELECT 
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as new_users
        FROM "User"
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
        """
        
        self.cursor.execute(query)
        user_growth = self.cursor.fetchall()
        
        if user_growth:
            months = [row[0].strftime('%Y-%m') for row in user_growth]
            counts = [row[1] for row in user_growth]
            
            axes[0, 0].bar(months, counts, color='skyblue')
            axes[0, 0].set_title('Crecimiento Mensual de Usuarios')
            axes[0, 0].set_ylabel('Nuevos Usuarios')
            axes[0, 0].tick_params(axis='x', rotation=45)
        
        # 2. Actividad de mediciones por día de la semana
        query = """
        SELECT 
            EXTRACT(DOW FROM created_at) as day_of_week,
            COUNT(*) as measurement_count
        FROM "Measurement"
        GROUP BY EXTRACT(DOW FROM created_at)
        ORDER BY day_of_week
        """
        
        self.cursor.execute(query)
        daily_activity = self.cursor.fetchall()
        
        if daily_activity:
            days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
            day_nums = [int(row[0]) for row in daily_activity]
            counts = [row[1] for row in daily_activity]
            
            # Reordenar para que empiece en lunes
            day_labels = [days[(d + 1) % 7] for d in day_nums]
            
            axes[0, 1].bar(day_labels, counts, color='lightgreen')
            axes[0, 1].set_title('Actividad por Día de la Semana')
            axes[0, 1].set_ylabel('Mediciones')
        
        # 3. Distribución de campos por ubicación (top 5)
        query = """
        SELECT location, COUNT(*) as field_count
        FROM "Field"
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location
        ORDER BY field_count DESC
        LIMIT 5
        """
        
        self.cursor.execute(query)
        locations = self.cursor.fetchall()
        
        if locations:
            loc_names = [row[0] for row in locations]
            counts = [row[1] for row in locations]
            
            axes[1, 0].pie(counts, labels=loc_names, autopct='%1.1f%%', startangle=90)
            axes[1, 0].set_title('Distribución de Campos por Ubicación')
        
        # 4. Resumen de métricas principales
        basic_stats = self.get_basic_stats()
        metrics = ['Usuarios', 'Campos', 'Corrales', 'Mediciones']
        values = [
            basic_stats['total_users'],
            basic_stats['total_fields'],
            basic_stats['total_pens'],
            basic_stats['total_measurements']
        ]
        
        axes[1, 1].bar(metrics, values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
        axes[1, 1].set_title('Métricas Principales')
        axes[1, 1].set_ylabel('Cantidad')
        
        plt.tight_layout()
        plt.savefig('farm_track_analytics.png', dpi=300, bbox_inches='tight')
        print("✅ Gráfico guardado como 'farm_track_analytics.png'")
        
        return True
    
    def export_to_json(self, data):
        """Exportar datos a JSON"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'farm_track_report_{timestamp}.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str, ensure_ascii=False)
        
        print(f"✅ Reporte exportado a {filename}")
        return filename
    
    def close_connection(self):
        """Cerrar conexión a la base de datos"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✅ Conexión cerrada")

def main():
    """Función principal"""
    print("🚀 Farm Track Analytics - Iniciando análisis...")
    print("=" * 60)
    
    analytics = FarmTrackAnalytics()
    
    try:
        # Ejecutar análisis completo
        summary = analytics.generate_usage_summary()
        analytics.get_activity_analysis()
        analytics.get_geographic_distribution()
        analytics.get_productivity_metrics()
        
        # Crear visualizaciones
        analytics.create_visualizations()
        
        # Exportar datos
        analytics.export_to_json(summary)
        
        print("\n🎉 Análisis completado exitosamente!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error durante el análisis: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        analytics.close_connection()

if __name__ == "__main__":
    main()
