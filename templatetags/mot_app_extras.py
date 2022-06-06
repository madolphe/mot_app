from django import template

register = template.Library()


@register.filter
def addstr(arg1, arg2):
    """concatenate arg1 & arg2"""
    return str(arg1) + str(arg2)


@register.simple_tag
def check_language_code(code="None"):
    if code != "fr" and code != "en":
        return "en"
    return code
