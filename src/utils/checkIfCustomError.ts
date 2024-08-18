import createHttpError from 'http-errors'
import createError from 'http-errors'

export default function checkIfCustomError(
  error: unknown,
  mensagemErroPadrão?: string
) {
  if (createHttpError.isHttpError(error)) {
    throw error
  } else {
    if (mensagemErroPadrão) {
      throw createError(500, mensagemErroPadrão)
    } else {
      throw createError(500, 'Erro interno do servidor, tente novamente!')
    }
  }
}
