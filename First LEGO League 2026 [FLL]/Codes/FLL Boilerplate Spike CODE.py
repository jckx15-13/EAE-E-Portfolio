"""
Project:    FLL Competition Baseline Code [1]]
Type:       spike, word-blocks, slot 0
Last saved: 2026-03-15T16:31:43.484Z
"""

from pybricks.hubs import PrimeHub
from pybricks.parameters import Stop, Direction, Port
from pybricks.pupdevices import Motor
from pybricks.robotics import DriveBase
from pybricks.tools import wait

def float_safe(value, default=0):
    try: return float(value)
    except: return default
def convert_speed(pct):
    return float_safe(pct) * 10
def motorpair_move(motor_left, motor_right, steer, value):
    secondary_value = (50 - abs(steer)) * 2 / 100 * value
    motor_left.run(value if steer>=0 else secondary_value)
    motor_right.run(value if steer<=0 else secondary_value)
def relative_position(motor):
    angle_mod = motor.angle() % 360
    return angle_mod if angle_mod <= 180 else angle_mod - 360

hub = PrimeHub()
motor_a = Motor(Port.A)
motor_d = Motor(Port.D)
motor_e = Motor(Port.E, Direction.COUNTERCLOCKWISE)
drivebase = DriveBase(motor_e, motor_a, 56, 117)
default_speeds = {motor_a: 500, motor_d: 500, motor_e: 500, drivebase: 500}

# ------------------------------- GROUP: START ------------------------------- #
def stack1_whenprogramstarts_fn():
    initialise()
    motor_d.run_target(default_speeds[motor_d], 250)
    go_straight("63", "80", "0")
    turn_right_45("15")
    go_straight("2", "30", "45")
    collect()
    drivebase.straight(-100)
# ------------------------------ GROUP: MYBLOCK ------------------------------ #
def initialise():
    # setting drivebase motor pair to E, A here. First one E, A is applied for the complete code.
    default_speeds[drivebase] = 500
    # setting drivebase wheel distance to 175, that is wheel diameter 56 mm - this will apply for the complete code
    # setting drivebase stop at end to Stop.BRAKE
    drivebase.straight(-10, Stop.BRAKE)
    hub.imu.reset_heading(0)
def turn_right_45(speed: string):
    default_speeds[drivebase] = convert_speed(speed)
    motorpair_move(motor_e, motor_a, 100, default_speeds[drivebase])
    start_left, start_right = motor_e.angle(), motor_a.angle()
    while max(abs(start_left - motor_e.angle()), abs(start_right - motor_a.angle())) <= 100: 
        pass
    drivebase.brake()
    drivebase.stop()
def collect():
    default_speeds[motor_d] = 30
    motor_d.run_angle(default_speeds[motor_d], 69)
    wait(250)
    go_straight("6", "15", "45")
    default_speeds[motor_d] = 30
    motor_d.run_angle(default_speeds[motor_d], -50.67)
def go_back():
    default_speeds[drivebase] = 300
    drivebase.straight(-120, Stop.BRAKE)
    motorpair_move(motor_e, motor_a, -100, default_speeds[drivebase])
    start_left, start_right = motor_e.angle(), motor_a.angle()
    while max(abs(start_left - motor_e.angle()), abs(start_right - motor_a.angle())) <= 45: 
        pass
    drivebase.brake()
def straight_reverse(cm: string, speed: string, base_angle: string):
    # setting drivebase motor pair to A, E here. First one E, A is applied for the complete code.
    default_speeds[drivebase] = convert_speed(speed)
    motor_e.reset_angle(0)
    while not (relative_position(motor_e) > float_safe(cm) / 17.5 * 360):
        motorpair_move(motor_e, motor_a, (float_safe(base_angle) - hub.imu.heading()) * 2, default_speeds[drivebase])
    drivebase.stop()
def go_straight(cm: string, speed: string, base_angle: string):
    # error with: flippermove_setMovementPair(pair: base_angle) @ 5g%[=0FCHOZr!+2TQQGB - Cannot handle dynamic port setting yet.
    default_speeds[drivebase] = convert_speed(speed)
    motor_a.reset_angle(0)
    while not (relative_position(motor_a) > float_safe(cm) / 17.5 * 360):
        motorpair_move(motor_e, motor_a, (float_safe(base_angle) - hub.imu.heading()) * 2, default_speeds[drivebase])
    drivebase.stop()

stack1_whenprogramstarts_fn()