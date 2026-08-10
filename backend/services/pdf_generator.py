import os
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

def generate_fira_report(farm_data: dict, output_path: str):
    """
    Generates an official-looking PDF report for Agroasemex / FIRA validation.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=15,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#334155'),
        spaceAfter=10,
        spaceBefore=15
    )

    normal_style = styles['Normal']
    
    elements = []

    # Title
    elements.append(Paragraph("REPORTE OFICIAL DE DIAGNÓSTICO AGRÍCOLA", title_style))
    elements.append(Paragraph("Documento de validación técnica para FIRA / Agroasemex", subtitle_style))
    elements.append(Spacer(1, 15))

    # Basic Info
    farm_name = farm_data.get('name', 'Parcela Sin Nombre')
    created_at = farm_data.get('created_at', datetime.utcnow().isoformat())
    
    # Formatting date
    try:
        formatted_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).strftime("%d de %B, %Y")
    except:
        formatted_date = str(created_at)

    info_data = [
        ['Nombre de la Parcela:', farm_name],
        ['Fecha de Diagnóstico:', formatted_date],
        ['Generado por:', 'AgriSaaS - AI Agronomist Platform'],
        ['ID Único:', str(farm_data.get('id', 'N/A'))]
    ]

    info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1'))
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 20))

    # Risk Analysis Section
    elements.append(Paragraph("1. Análisis de Riesgo Hídrico y Fenológico", subtitle_style))
    
    risk_data = farm_data.get('risk_data', {})
    risk_score = risk_data.get('water_risk_score', 'N/A')
    climate_alert = risk_data.get('climate_alert', 'N/A')
    
    elements.append(Paragraph(f"<b>Puntaje de Estrés Hídrico:</b> <font color='red'>{risk_score}</font>/100 (Alerta: {climate_alert})", normal_style))
    elements.append(Spacer(1, 5))
    
    diagnosis = risk_data.get('recommendation', 'Sin diagnóstico registrado.')
    elements.append(Paragraph(f"<b>Diagnóstico de Inteligencia Artificial:</b>", normal_style))
    elements.append(Paragraph(diagnosis, normal_style))
    elements.append(Spacer(1, 15))

    # Historical Data Table
    elements.append(Paragraph("2. Historial de Índice de Vegetación (NDVI)", subtitle_style))
    
    trend_data = risk_data.get('ndvi_trend', [])
    if trend_data and len(trend_data) > 0:
        table_data = [['Mes / Fecha', 'Índice NDVI', 'Estado de Salud']]
        for entry in trend_data:
            val = entry.get('value', entry.get('ndvi', 0))
            month = entry.get('month', entry.get('date', ''))
            
            # Simple analytical categorization
            estado = "Óptimo" if float(val) > 0.6 else ("Estrés Moderado" if float(val) > 0.3 else "Crítico")
            table_data.append([str(month), str(val), estado])
            
        trend_table = Table(table_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
        trend_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc'))
        ]))
        elements.append(trend_table)
    else:
        elements.append(Paragraph("No hay historial NDVI disponible para este reporte.", normal_style))
        
    elements.append(Spacer(1, 20))
    
    # New Analytical Section
    elements.append(Paragraph("3. Proyección de Riego y Ahorro Energético (Tarifa 9N CFE)", subtitle_style))
    
    # Mockup Data for analytical focus
    energy_data = [
        ['Potencia de Bomba (Estimada):', '30 HP'],
        ['Caudal del Pozo:', '25 Litros / seg'],
        ['Déficit de Humedad del Suelo:', risk_data.get('moisture_content', '35%')],
        ['Horas de Riego Sugeridas:', '8.5 horas'],
        ['Ahorro Proyectado (Tarifa Nocturna):', '$ 4,250.00 MXN / mes']
    ]
    
    energy_table = Table(energy_data, colWidths=[3*inch, 3*inch])
    energy_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, -1), (1, -1), colors.HexColor('#16a34a')), # Highlight savings
        ('FONTNAME', (1, -1), (1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0'))
    ]))
    
    elements.append(energy_table)
    elements.append(Spacer(1, 30))

    # Disclaimer
    disclaimer = """<font size=8 color="#64748b">
    * Este documento es generado automáticamente mediante análisis de teledetección (Sentinel-2) 
    e Inteligencia Artificial. Válido como referencia técnica para inspecciones de 
    aseguradoras agrícolas e instituciones de crédito (FIRA).
    </font>"""
    elements.append(Paragraph(disclaimer, styles['Normal']))

    doc.build(elements)
    return output_path


def generate_compliance_audit_pdf(audit_data: dict, output_path: str) -> str:
    """
    Generates an executive-grade regulatory audit report for CFE and CONAGUA compliance.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'AuditTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#064e3b'), # Dark Emerald
        spaceAfter=4,
        alignment=1
    )
    
    subtitle_style = ParagraphStyle(
        'AuditSubtitle',
        parent=styles['Heading2'],
        fontSize=10,
        textColor=colors.HexColor('#047857'),
        spaceAfter=12,
        alignment=1
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        'NormalSmall',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        leading=12
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("DICTAMEN DE AUDITORÍA REGULATORIA Y ENERGÉTICA", title_style))
    elements.append(Paragraph("CUMPLIMIENTO NORMATIVO CONAGUA (REPDA) Y OPTIMIZACIÓN TARIFARIA CFE (TARIFA 9N)", subtitle_style))
    elements.append(Spacer(1, 10))

    # 1. Farm Overview
    overview = audit_data.get('farm_overview', {})
    coords = overview.get('coordinates', {})
    elements.append(Paragraph("<b>1. FICHA TÉCNICA Y GEORREFERENCIACIÓN DEL PREDIO</b>", section_heading))
    
    info_table_data = [
        ['Nombre del Predio:', overview.get('name', 'N/A'), 'Superficie Agrícola:', f"{overview.get('hectares', 0)} Hectáreas"],
        ['Cultivo Principal:', overview.get('crop', 'N/A'), 'Fuente de Telemetría:', overview.get('sensor_source', 'N/A')],
        ['Coordenadas GPS:', f"Lat: {coords.get('lat', 'N/A')}, Lon: {coords.get('lon', 'N/A')}", 'Folio Auditoría:', audit_data.get('audit_id', 'AUD-001')]
    ]
    
    t_info = Table(info_table_data, colWidths=[1.8*inch, 2.0*inch, 1.6*inch, 1.8*inch])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f8fafc')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1'))
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 10))

    # 2. CONAGUA & Hydrological Status
    conagua = audit_data.get('conagua_regulatory', {})
    elements.append(Paragraph("<b>2. EVALUACIÓN DE CUMPLIMIENTO HÍDRICO CONAGUA & REPDA</b>", section_heading))
    
    conagua_badge = conagua.get('compliance_badge', {})
    status_bg = colors.HexColor('#fef2f2') if conagua_badge.get('color') == 'RED' else colors.HexColor('#ecfdf5')
    status_text = colors.HexColor('#991b1b') if conagua_badge.get('color') == 'RED' else colors.HexColor('#065f46')

    conagua_table_data = [
        ['Acuífero Oficial CONAGUA:', conagua.get('aquifer_name', 'N/A')],
        ['Estatus Legal de Veda:', conagua.get('veda_status', 'N/A')],
        ['Monitor de Sequía (SMN):', conagua.get('drought_monitor_level', 'N/A')],
        ['Cuota Anual Autorizada:', f"{conagua.get('quota_annual_authorized_m3', 0):,.1f} m³"],
        ['Extracción Ciclo Estimada:', f"{conagua.get('estimated_cycle_extraction_m3', 0):,.1f} m³ ({conagua.get('quota_utilization_pct', 0)}% de cuota)"],
        ['Dictamen Legal CONAGUA:', conagua_badge.get('status', 'NORMAL')]
    ]
    
    t_conagua = Table(conagua_table_data, colWidths=[2.6*inch, 4.6*inch])
    t_conagua.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (1, -1), (1, -1), status_bg),
        ('TEXTCOLOR', (1, -1), (1, -1), status_text),
        ('FONTNAME', (1, -1), (1, -1), 'Helvetica-Bold')
    ]))
    elements.append(t_conagua)
    elements.append(Spacer(1, 10))

    # 3. CFE Energy & Cost Optimization
    cfe = audit_data.get('cfe_energy_analysis', {})
    elements.append(Paragraph("<b>3. AUDITORÍA ENERGÉTICA Y OPTIMIZACIÓN TARIFARIA CFE (TARIFA 9N)</b>", section_heading))
    
    cfe_table_data = [
        ['Potencia de Bomba de Pozo:', f"{cfe.get('pump_power_hp', 0)} HP ({cfe.get('power_kw', 0)} kW)", 'Horas Riego Necesarias:', f"{cfe.get('irrigation_hours_needed', 0)} hrs"],
        ['Consumo Eléctrico Estimado:', f"{cfe.get('total_kwh_required', 0)} kWh", 'Tarifa Agrícola Oficial:', cfe.get('tariff_applied', 'Tarifa 9N')],
        ['Costo en Horario Punta (18:00 - 22:00):', f"${cfe.get('cost_in_peak_hours_mxn', 0):,.2f} MXN", 'Costo en Horario Nocturno (Tarifa 9N):', f"${cfe.get('cost_in_night_9n_mxn', 0):,.2f} MXN"],
        ['AHORRO FINANCIERO PROYECTADO:', f"${cfe.get('net_savings_mxn', 0):,.2f} MXN ({cfe.get('savings_percentage', 0)}% Ahorro)", '', '']
    ]

    t_cfe = Table(cfe_table_data, colWidths=[2.4*inch, 1.8*inch, 1.8*inch, 1.2*inch])
    t_cfe.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 2), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (2, 0), (2, 2), colors.HexColor('#f8fafc')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('SPAN', (1, 3), (3, 3)),
        ('BACKGROUND', (0, 3), (3, 3), colors.HexColor('#dcfce7')),
        ('TEXTCOLOR', (0, 3), (3, 3), colors.HexColor('#166534')),
        ('FONTNAME', (0, 3), (3, 3), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5)
    ]))
    elements.append(t_cfe)
    elements.append(Spacer(1, 10))

    # 4. Risk Matrix & Prescriptive Action Plan
    elements.append(Paragraph("<b>4. MATRIZ DE RIESGOS Y PLAN DE ACCIÓN PRESCRIPTIVO</b>", section_heading))
    
    risk_list = audit_data.get('risk_matrix', [])
    risk_rows = [['Dominio Evaluado', 'Nivel de Riesgo', 'Detalle Técnico y Recomendación']]
    for r in risk_list:
        risk_rows.append([r.get('domain', ''), r.get('level', ''), r.get('details', '')])

    t_risk = Table(risk_rows, colWidths=[1.8*inch, 1.2*inch, 4.2*inch])
    t_risk.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#064e3b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4)
    ]))
    elements.append(t_risk)
    elements.append(Spacer(1, 8))

    action_plan = audit_data.get('action_plan', {})
    elements.append(Paragraph(f"<b>Recomendación Operativa Inmediata:</b> Programar encendido de bomba a las <b>{action_plan.get('recommended_start')}</b> durante {action_plan.get('recommended_duration_hours')} horas.", normal_style))
    elements.append(Paragraph(f"<b>Notificación SMS Automatizada:</b> <i>\"{action_plan.get('suggested_sms_alert', '')}\"</i>", normal_style))
    elements.append(Spacer(1, 15))

    # 5. Technical Validation Seal
    seal_text = f"""<font size=7 color="#64748b">
    DOCUMENTO AUDITABLE EMITIDO POR AGRISAAS AI AGRONOMIST PLATFORM • FECHA: {datetime.utcnow().strftime('%d/%m/%Y %H:%M UTC')} • 
    METODOLOGÍA: FUSIÓN DE TELEDETECCIÓN MULTIESPECTRAL (SENTINEL-2), TELEMETRÍA IOT Y LEY DE AGUAS NACIONALES (CONAGUA) / TARIFAJE CFE.
    </font>"""
    elements.append(Paragraph(seal_text, normal_style))

    doc.build(elements)
    return output_path

