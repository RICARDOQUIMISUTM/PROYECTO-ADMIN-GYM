from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# Modelos de la base de datos 
class Cliente(db.Model):
    __tablename__ = 'Clientes'
    
    id_cliente = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    fecha_registro = db.Column(db.Date, nullable=False)
    estado = db.Column(db.Enum('activo', 'inactivo'), nullable=False, default='activo')
    
    def to_dict(self):
        return {
            'id_cliente': self.id_cliente,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'dni': self.dni,
            'correo': self.correo,
            'telefono': self.telefono,
            'fecha_registro': self.fecha_registro.strftime('%Y-%m-%d'),
            'estado': self.estado
        }

class Entrenador(db.Model):
    __tablename__ = 'Entrenadores'
    
    id_entrenador = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    especialidad = db.Column(db.String(50), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    
    def to_dict(self):
        return {
            'id_entrenador': self.id_entrenador,
            'nombre': self.nombre,
            'especialidad': self.especialidad,
            'telefono': self.telefono,
            'correo': self.correo
        }

class Rutina(db.Model):
    __tablename__ = 'Rutinas'
    
    id_rutina = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    nivel = db.Column(db.Enum('básico', 'intermedio', 'avanzado'), nullable=False, default='básico')
    
    def to_dict(self):
        return {
            'id_rutina': self.id_rutina,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'nivel': self.nivel
        }

class Asignacion(db.Model):
    __tablename__ = 'Asignaciones'
    
    id_asignacion = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey('Clientes.id_cliente', ondelete='CASCADE'), nullable=False)
    id_rutina = db.Column(db.Integer, db.ForeignKey('Rutinas.id_rutina', ondelete='CASCADE'), nullable=False)
    id_entrenador = db.Column(db.Integer, db.ForeignKey('Entrenadores.id_entrenador', ondelete='CASCADE'), nullable=False)
    fecha_asignacion = db.Column(db.Date, nullable=False)
    
    cliente = db.relationship('Cliente', backref=db.backref('asignaciones', cascade='all, delete-orphan'))
    rutina = db.relationship('Rutina', backref=db.backref('asignaciones', cascade='all, delete-orphan'))
    entrenador = db.relationship('Entrenador', backref=db.backref('asignaciones', cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id_asignacion': self.id_asignacion,
            'id_cliente': self.id_cliente,
            'id_rutina': self.id_rutina,
            'id_entrenador': self.id_entrenador,
            'fecha_asignacion': self.fecha_asignacion.strftime('%Y-%m-%d'),
            'cliente_nombre': self.cliente.nombre + ' ' + self.cliente.apellido,
            'rutina_nombre': self.rutina.nombre,
            'entrenador_nombre': self.entrenador.nombre
        }

class Pago(db.Model):
    __tablename__ = 'Pagos'
    
    id_pago = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey('Clientes.id_cliente', ondelete='CASCADE'), nullable=False)
    fecha_pago = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    tipo = db.Column(db.Enum('mensualidad', 'inscripción', 'personalizado', 'otros'), nullable=False)
    estado = db.Column(db.Enum('pagado', 'pendiente'), nullable=False, default='pendiente')
    
    cliente = db.relationship('Cliente', backref=db.backref('pagos', cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id_pago': self.id_pago,
            'id_cliente': self.id_cliente,
            'fecha_pago': self.fecha_pago.strftime('%Y-%m-%d'),
            'monto': float(self.monto),
            'tipo': self.tipo,
            'estado': self.estado,
            'cliente_nombre': self.cliente.nombre + ' ' + self.cliente.apellido
        }

# Rutas principales
@app.route('/')
def index():
    # Obtener el conteo de usuarios activos
    active_users = Cliente.query.filter_by(estado='activo').count()
    return render_template('index.html', active_users=active_users)

# Página de administración de clientes
@app.route('/admin/clientes')
def panel_clientes():
    clientes = Cliente.query.all()
    pagos = Pago.query.all()
    return render_template('admin_clientes.html', 
                         clientes=clientes,
                         pagos=pagos)

# Página de administración de entrenadores
@app.route('/admin/entrenadores')
def panel_entrenadores():
    entrenadores = Entrenador.query.all()
    rutinas = Rutina.query.all()
    asignaciones = Asignacion.query.all()
    clientes = Cliente.query.all()  # Necesario para el modal de asignaciones
    return render_template('admin_entrenadores.html', 
                         entrenadores=entrenadores,
                         rutinas=rutinas,
                         asignaciones=asignaciones,
                         clientes=clientes)

# API para clientes 
@app.route('/api/clientes', methods=['GET', 'POST'])
def api_clientes():
    if request.method == 'POST':
        data = request.get_json()
        nuevo_cliente = Cliente(
            nombre=data['nombre'],
            apellido=data['apellido'],
            dni=data['dni'],
            correo=data['correo'],
            telefono=data['telefono'],
            fecha_registro=datetime.now().date(),
            estado=data.get('estado', 'activo')
        )
        db.session.add(nuevo_cliente)
        db.session.commit()
        return jsonify({'message': 'Cliente creado exitosamente', 'id': nuevo_cliente.id_cliente}), 201
    
    clientes = Cliente.query.all()
    return jsonify([cliente.to_dict() for cliente in clientes])

@app.route('/api/clientes/<int:id>/rutinas')
def get_rutinas_cliente(id):
    asignaciones = Asignacion.query.filter_by(id_cliente=id).join(Rutina).all()
    rutinas = [{'nombre': a.rutina.nombre, 'nivel': a.rutina.nivel} for a in asignaciones]
    return jsonify(rutinas)

@app.route('/api/clientes/<int:id>/pagos')
def get_pagos_cliente(id):
    estado = request.args.get('estado')
    query = Pago.query.filter_by(id_cliente=id)
    if estado:
        query = query.filter_by(estado=estado)
    pagos = query.all()
    return jsonify([{
        'tipo': p.tipo,
        'monto': float(p.monto),
        'fecha_pago': p.fecha_pago.strftime('%Y-%m-%d'),
        'estado': p.estado
    } for p in pagos])

@app.route('/api/clientes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def api_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.get_json()
        cliente.nombre = data.get('nombre', cliente.nombre)
        cliente.apellido = data.get('apellido', cliente.apellido)
        cliente.dni = data.get('dni', cliente.dni)
        cliente.correo = data.get('correo', cliente.correo)
        cliente.telefono = data.get('telefono', cliente.telefono)
        cliente.estado = data.get('estado', cliente.estado)
        db.session.commit()
        return jsonify({'message': 'Cliente actualizado exitosamente'})
    
    if request.method == 'DELETE':
        try:
            Asignacion.query.filter_by(id_cliente=id).delete()
            Pago.query.filter_by(id_cliente=id).delete()
            db.session.delete(cliente)
            db.session.commit()
            return jsonify({'message': 'Cliente eliminado exitosamente'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error al eliminar el cliente: {str(e)}'}), 500
    
    return jsonify(cliente.to_dict())

# API para entrenadores 
@app.route('/api/entrenadores', methods=['GET', 'POST'])
def api_entrenadores():
    if request.method == 'POST':
        data = request.get_json()
        nuevo_entrenador = Entrenador(
            nombre=data['nombre'],
            especialidad=data['especialidad'],
            telefono=data['telefono'],
            correo=data['correo']
        )
        db.session.add(nuevo_entrenador)
        db.session.commit()
        return jsonify({'message': 'Entrenador creado exitosamente', 'id': nuevo_entrenador.id_entrenador}), 201
    
    entrenadores = Entrenador.query.all()
    return jsonify([entrenador.to_dict() for entrenador in entrenadores])

@app.route('/api/entrenadores/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def api_entrenador(id):
    entrenador = Entrenador.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.get_json()
        entrenador.nombre = data.get('nombre', entrenador.nombre)
        entrenador.especialidad = data.get('especialidad', entrenador.especialidad)
        entrenador.telefono = data.get('telefono', entrenador.telefono)
        entrenador.correo = data.get('correo', entrenador.correo)
        db.session.commit()
        return jsonify({'message': 'Entrenador actualizado exitosamente'})
    
    if request.method == 'DELETE':
        try:
            Asignacion.query.filter_by(id_entrenador=id).delete()
            db.session.delete(entrenador)
            db.session.commit()
            return jsonify({'message': 'Entrenador eliminado exitosamente'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error al eliminar el entrenador: {str(e)}'}), 500
    
    return jsonify(entrenador.to_dict())

# API para rutinas 
@app.route('/api/rutinas', methods=['GET', 'POST'])
def api_rutinas():
    if request.method == 'POST':
        data = request.get_json()
        nueva_rutina = Rutina(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            nivel=data.get('nivel', 'básico')
        )
        db.session.add(nueva_rutina)
        db.session.commit()
        return jsonify({'message': 'Rutina creada exitosamente', 'id': nueva_rutina.id_rutina}), 201
    
    rutinas = Rutina.query.all()
    return jsonify([rutina.to_dict() for rutina in rutinas])

@app.route('/api/rutinas/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def api_rutina(id):
    rutina = Rutina.query.get_or_404(id)
    
    if request.method == 'PUT':
        data = request.get_json()
        rutina.nombre = data.get('nombre', rutina.nombre)
        rutina.descripcion = data.get('descripcion', rutina.descripcion)
        rutina.nivel = data.get('nivel', rutina.nivel)
        db.session.commit()
        return jsonify({'message': 'Rutina actualizada exitosamente'})
    
    if request.method == 'DELETE':
        try:
            Asignacion.query.filter_by(id_rutina=id).delete()
            db.session.delete(rutina)
            db.session.commit()
            return jsonify({'message': 'Rutina eliminada exitosamente'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error al eliminar la rutina: {str(e)}'}), 500
    
    return jsonify(rutina.to_dict())

# API para asignaciones 
@app.route('/api/asignaciones', methods=['GET', 'POST'])
def api_asignaciones():
    if request.method == 'POST':
        data = request.get_json()
        nueva_asignacion = Asignacion(
            id_cliente=data['id_cliente'],
            id_rutina=data['id_rutina'],
            id_entrenador=data['id_entrenador'],
            fecha_asignacion=datetime.now().date()
        )
        db.session.add(nueva_asignacion)
        db.session.commit()
        return jsonify({'message': 'Asignación creada exitosamente', 'id': nueva_asignacion.id_asignacion}), 201
    
    asignaciones = Asignacion.query.all()
    return jsonify([asignacion.to_dict() for asignacion in asignaciones])

# API para pagos 
@app.route('/api/pagos', methods=['GET', 'POST'])
def api_pagos():
    
    if request.method == 'POST':
        data = request.get_json()
        nuevo_pago = Pago(
            id_cliente=data['id_cliente'],
            fecha_pago=datetime.strptime(data['fecha_pago'], '%Y-%m-%d').date(),
            monto=data['monto'],
            tipo=data['tipo'],
            estado=data.get('estado', 'pendiente')
        )
        db.session.add(nuevo_pago)
        db.session.commit()
        return jsonify({'message': 'Pago registrado exitosamente', 'id': nuevo_pago.id_pago}), 201
    
    pagos = Pago.query.all()
    return jsonify([pago.to_dict() for pago in pagos])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)