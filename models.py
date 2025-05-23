from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

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
    
    asignaciones = db.relationship('Asignacion', backref='cliente', lazy=True)
    pagos = db.relationship('Pago', backref='cliente', lazy=True)
    
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
    
    asignaciones = db.relationship('Asignacion', backref='entrenador', lazy=True)
    
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
    
    asignaciones = db.relationship('Asignacion', backref='rutina', lazy=True)
    
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
    id_cliente = db.Column(db.Integer, db.ForeignKey('Clientes.id_cliente'), nullable=False)
    id_rutina = db.Column(db.Integer, db.ForeignKey('Rutinas.id_rutina'), nullable=False)
    id_entrenador = db.Column(db.Integer, db.ForeignKey('Entrenadores.id_entrenador'), nullable=False)
    fecha_asignacion = db.Column(db.Date, nullable=False)
    
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
    id_cliente = db.Column(db.Integer, db.ForeignKey('Clientes.id_cliente'), nullable=False)
    fecha_pago = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    tipo = db.Column(db.Enum('mensualidad', 'inscripción', 'personalizado', 'otros'), nullable=False)
    estado = db.Column(db.Enum('pagado', 'pendiente'), nullable=False, default='pendiente')
    
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